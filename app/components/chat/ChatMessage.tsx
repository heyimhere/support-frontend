import React from 'react';
import { Message, MessageRole } from '../../types/chat';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { cn, formatRelativeTime } from '../../lib/utils';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatest = false,
  showTimestamp = true,
  showAvatar = true,
  className,
}) => {
  const isUser = message.role === MessageRole.USER;
  const isAssistant = message.role === MessageRole.ASSISTANT;
  const isSystem = message.role === MessageRole.SYSTEM;

  const getMessageIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    if (isAssistant) return <Bot className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getMessageColors = () => {
    if (isUser) {
      return {
        container: 'ml-auto bg-primary text-primary-foreground',
        avatar: 'bg-primary text-primary-foreground',
      };
    }
    if (isAssistant) {
      return {
        container: 'mr-auto bg-muted',
        avatar: 'bg-blue-500 text-white',
      };
    }
    return {
      container: 'mx-auto bg-yellow-50 border-yellow-200 text-yellow-800',
      avatar: 'bg-yellow-500 text-white',
    };
  };

  const colors = getMessageColors();

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    const formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br />'); // Line breaks

    return { __html: formatted };
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 group transition-all duration-200',
        isUser && 'flex-row-reverse',
        isSystem && 'justify-center',
        isLatest && 'animate-in slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && !isSystem && (
        <div className="flex-shrink-0">
          <Avatar className={cn('h-8 w-8', colors.avatar)}>
            <AvatarFallback className={colors.avatar}>
              {getMessageIcon()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[80%] min-w-0',
          isSystem && 'max-w-[60%]'
        )}
      >
        {/* Message Bubble */}
        <Card
          className={cn(
            'border shadow-sm transition-all duration-200',
            colors.container,
            isUser && 'border-primary/20',
            isAssistant && 'border-border',
            isSystem && 'border-yellow-200 text-center',
            'group-hover:shadow-md'
          )}
        >
          <CardContent className="p-3">
            {/* Message Text */}
            <div
              className={cn(
                'text-sm leading-relaxed whitespace-pre-wrap break-words',
                isUser && 'text-primary-foreground',
                isAssistant && 'text-foreground',
                isSystem && 'text-yellow-800 text-xs font-medium'
              )}
              dangerouslySetInnerHTML={formatMessageContent(message.content)}
            />

            {/* Message Metadata */}
            {message.metadata && Object.keys(message.metadata).length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/20">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(message.metadata).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamp */}
        {showTimestamp && (
          <div
            className={cn(
              'text-xs text-muted-foreground px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              isUser && 'text-right',
              isSystem && 'text-center'
            )}
          >
            {formatRelativeTime(message.timestamp)}
          </div>
        )}
      </div>

      {/* Spacer for alignment */}
      {isSystem && showAvatar && <div className="w-8" />}
    </div>
  );
};

// Quick message variants for common use cases
export const UserMessage: React.FC<Omit<ChatMessageProps, 'message'> & { content: string; timestamp?: Date }> = ({
  content,
  timestamp = new Date(),
  ...props
}) => {
  const message: Message = {
    id: `user-${Date.now()}`,
    role: MessageRole.USER,
    content,
    timestamp,
  };

  return <ChatMessage message={message} {...props} />;
};

export const AssistantMessage: React.FC<Omit<ChatMessageProps, 'message'> & { content: string; timestamp?: Date }> = ({
  content,
  timestamp = new Date(),
  ...props
}) => {
  const message: Message = {
    id: `assistant-${Date.now()}`,
    role: MessageRole.ASSISTANT,
    content,
    timestamp,
  };

  return <ChatMessage message={message} {...props} />;
};

export const SystemMessage: React.FC<Omit<ChatMessageProps, 'message'> & { content: string; timestamp?: Date }> = ({
  content,
  timestamp = new Date(),
  ...props
}) => {
  const message: Message = {
    id: `system-${Date.now()}`,
    role: MessageRole.SYSTEM,
    content,
    timestamp,
  };

  return <ChatMessage message={message} {...props} />;
}; 