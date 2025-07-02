import React, { useRef, useEffect, useState } from 'react';
import { ConversationState } from '../../types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import {
  Bot,
  MessageSquare,
  RotateCcw,
  CheckCircle,
  User,
} from 'lucide-react';

interface ConversationFlowProps {
  conversation: ConversationState | null;
  onSendMessage: (message: string) => void;
  onStartConversation: () => void;
  onResetConversation: () => void;
  isLoading?: boolean;
  error?: string | null;
  typingState?: { isTyping: boolean; message?: string; estimatedDuration?: number };
  className?: string;
  showProgress?: boolean;
  showHeader?: boolean;
  autoFocus?: boolean;
}

export const ConversationFlow: React.FC<ConversationFlowProps> = ({
  conversation,
  onSendMessage,
  onStartConversation,
  onResetConversation,
  isLoading = false,
  error = null,
  typingState = { isTyping: false },
  className,
  showProgress = true,
  showHeader = true,
  autoFocus = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  // Effect for auto-scrolling
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, typingState.isTyping]);

  // Handle scroll to detect if user has scrolled up
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setShouldAutoScroll(isAtBottom);
  };

  // Get progress information
  const getProgressInfo = () => {
    if (!conversation) return { progress: 0, step: 'Not started' };
    
    const stepNames = {
      greeting: 'Getting started',
      collect_name: 'Collecting your name', 
      collect_issue: 'Describing the issue',
      clarify_details: 'Gathering details',
      suggest_category: 'Categorizing issue',
      confirm_category: 'Confirming category',
      final_confirmation: 'Final review',
      ticket_created: 'Ticket created',
      error: 'Error occurred',
    };

    const stepOrder = [
      'greeting', 'collect_name', 'collect_issue', 'clarify_details',
      'suggest_category', 'confirm_category', 'final_confirmation', 'ticket_created'
    ];

    const currentIndex = stepOrder.indexOf(conversation.currentStep);
    const progress = currentIndex >= 0 ? Math.round((currentIndex / (stepOrder.length - 1)) * 100) : 0;

    return {
      progress,
      step: stepNames[conversation.currentStep as keyof typeof stepNames] || 'In progress',
    };
  };

  const progressInfo = getProgressInfo();
  const isConversationStarted = !!conversation;
  const isConversationComplete = conversation?.isComplete || false;
  const canSendMessage = isConversationStarted && !isConversationComplete && !isLoading;

  // Get AI response suggestions if available
  const getAISuggestions = (): string[] => {
    if (!conversation || !conversation.messages.length) return [];
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage.role !== 'assistant') return [];

    // Extract suggestions from message metadata
    if (lastMessage.metadata?.suggestions) {
      return lastMessage.metadata.suggestions as string[];
    }

    // Default suggestions based on conversation step
    const step = conversation.currentStep;
    if (step === 'suggest_category' || step === 'confirm_category') {
             return ['Yes, that&apos;s correct', 'No, different category', 'Technical Issue', 'Billing'];
    }
    if (step === 'final_confirmation') {
      return ['Yes, create ticket', 'Make changes'];
    }

    return [];
  };

  if (!isConversationStarted) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Welcome to Support Chat</h3>
            <p className="text-muted-foreground">
              I'll help you create a support ticket by asking a few questions about your issue.
            </p>
          </div>
          
          <Button onClick={onStartConversation} size="lg" className="gap-2">
            <Bot className="h-4 w-4" />
            Start Conversation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('flex flex-col h-full w-full max-w-4xl mx-auto', className)}>
      {/* Header */}
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Support Assistant
              {isConversationComplete && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {conversation.collectedData.userName && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  {conversation.collectedData.userName}
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onResetConversation}
                className="gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && !isConversationComplete && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progressInfo.step}</span>
                <span className="text-muted-foreground">{progressInfo.progress}%</span>
              </div>
              <Progress value={progressInfo.progress} className="h-2" />
            </div>
          )}
        </CardHeader>
      )}

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea 
          className="flex-1 px-6"
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          <div className="space-y-4 py-4">
            {/* Messages */}
            {conversation.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === conversation.messages.length - 1}
                showTimestamp={true}
                showAvatar={true}
              />
            ))}

            {/* Typing Indicator */}
            <TypingIndicator typingState={typingState} />

            {/* Error Message */}
            {error && (
              <div className="flex justify-center">
                <Card className="bg-destructive/10 border-destructive/20">
                  <CardContent className="p-3">
                    <p className="text-destructive text-sm">{error}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Completion Message */}
            {isConversationComplete && (
              <div className="flex justify-center">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900 mb-1">
                      Support Ticket Created!
                    </h4>
                    <p className="text-sm text-green-700">
                      Your ticket has been successfully created. Our support team will review it shortly.
                    </p>
                    {conversation.createdTicketId && (
                      <Badge variant="outline" className="mt-2">
                        Ticket #{conversation.createdTicketId.slice(-8)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-6">
          <ChatInput
            onSend={onSendMessage}
            disabled={!canSendMessage}
            isLoading={isLoading}
            placeholder={
              isConversationComplete 
                ? 'Conversation completed' 
                : 'Type your response...'
            }
            suggestions={getAISuggestions()}
            autoFocus={autoFocus}
            allowMultiline={true}
            maxLength={1000}
          />
        </div>
      </div>
    </Card>
  );
};

// Compact version for smaller screens
export const CompactConversationFlow: React.FC<Omit<ConversationFlowProps, 'showHeader' | 'showProgress'>> = ({
  conversation,
  onSendMessage,
  onStartConversation,
  onResetConversation,
  isLoading = false,
  error = null,
  typingState = { isTyping: false },
  className,
  autoFocus = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, typingState.isTyping]);

  if (!conversation) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <h3 className="font-medium mb-2">Support Chat</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start a conversation to create a support ticket.
        </p>
        <Button onClick={onStartConversation} size="sm">
          <Bot className="h-4 w-4 mr-1" />
          Start Chat
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {conversation.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              showTimestamp={false}
              showAvatar={false}
            />
          ))}
          <TypingIndicator typingState={typingState} showAvatar={false} />
          {error && (
            <div className="text-xs text-destructive text-center">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <ChatInput
          onSend={onSendMessage}
          disabled={!conversation || conversation.isComplete || isLoading}
          isLoading={isLoading}
          placeholder="Type your response..."
          allowMultiline={false}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}; 