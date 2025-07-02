'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useToast } from '../components/ui/toast';
import { useKeyboardShortcuts } from '../components/ui/keyboard-shortcut';
import { useCommandPalette, CommandPalette, createDefaultCommands } from '../components/ui/command-palette';
import { LiveConnectionStatus } from '../components/ui/connection-status';
import { LoadingSpinner, LoadingOverlay } from '../components/ui/loading-spinner';
import { ConversationFlow } from '../components/chat/ConversationFlow';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  MessageSquare,
  Bot,
  CheckCircle,
  Share2,
  RotateCcw,
  ArrowLeft,
  Keyboard,
  Settings,
  Zap,
  Star,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const commandPalette = useCommandPalette();
  
  const {
    conversation,
    isLoading,
    error,
    typingState,
    startConversation,
    sendMessage,
    resetConversation,
    createTicket,
    getProgress,
    getSummary,
    canSendMessage,
  } = useChat();

  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  const progress = getProgress();
  const summary = getSummary();

  // Handle ticket creation
  const handleCreateTicket = async () => {
    if (!conversation?.isComplete) return;
    
    setIsCreatingTicket(true);
    try {
      const result = await createTicket();
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Ticket Created Successfully!',
          description: `Your support ticket #${result.ticketId?.slice(-8)} has been created.`,
          duration: 5000,
          action: {
            label: 'View Dashboard',
            onClick: () => router.push('/support'),
          },
        });
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Create Ticket',
          description: result.error || 'An unexpected error occurred.',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create ticket. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsCreatingTicket(false);
    }
  };

  // Handle conversation sharing
  const handleShare = async () => {
    if (!conversation) return;

    try {
      const shareData = {
        title: 'Support Conversation',
        text: `I had a great conversation with the AI assistant about my support issue.`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addToast({
          type: 'success',
          description: 'Conversation shared successfully!',
          duration: 3000,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        addToast({
          type: 'success',
          description: 'Link copied to clipboard!',
          duration: 3000,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        description: 'Failed to share conversation.',
        duration: 3000,
      });
    }
  };

  // Handle conversation reset
  const handleReset = () => {
    resetConversation();
    addToast({
      type: 'info',
      description: 'Conversation reset. Ready to start over!',
      duration: 3000,
    });
  };

  // Keyboard shortcuts
  const shortcuts = [
    {
      id: 'new-conversation',
      keys: ['ctrl', 'n'],
      description: 'Start new conversation',
      action: () => {
        if (!conversation) {
          startConversation();
        } else {
          handleReset();
        }
      },
      category: 'Actions',
    },
    {
      id: 'share',
      keys: ['ctrl', 's'],
      description: 'Share conversation',
      action: handleShare,
      category: 'Actions',
      disabled: !conversation,
    },
    {
      id: 'create-ticket',
      keys: ['ctrl', 'enter'],
      description: 'Create ticket',
      action: handleCreateTicket,
      category: 'Actions',
      disabled: !conversation?.isComplete,
    },
    {
      id: 'keyboard-help',
      keys: ['?'],
      description: 'Show keyboard shortcuts',
      action: () => setShowKeyboardHelp(true),
      category: 'Help',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  // Command palette commands
  const commands = createDefaultCommands({
    onNavigateToChat: () => router.push('/chat'),
    onNavigateToSupport: () => router.push('/support'),
    onCreateTicket: () => startConversation(),
    onRefreshData: () => window.location.reload(),
    onToggleFilters: () => addToast({ type: 'info', description: 'No filters available on chat page' }),
    onShowSettings: () => addToast({ type: 'info', description: 'Settings not implemented yet' }),
    onShowKeyboardHelp: () => setShowKeyboardHelp(true),
    onToggleTheme: () => addToast({ type: 'info', description: 'Theme toggle not implemented yet' }),
  });

  // Show error toasts
  useEffect(() => {
    if (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: error,
        duration: 5000,
      });
    }
  }, [error, addToast]);

  // Welcome message when starting
  useEffect(() => {
    if (conversation && conversation.messages.length === 1) {
      addToast({
        type: 'info',
        title: 'Welcome!',
        description: 'I\'m here to help you create a support ticket. Let\'s get started!',
        duration: 4000,
      });
    }
  }, [conversation, addToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Support Chat
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Get help with your questions
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              {conversation && (
                <div className="hidden md:flex items-center gap-3 ml-8">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Progress</span>
                  </div>
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <LiveConnectionStatus compact={true} />

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowKeyboardHelp(true)}
              >
                <Keyboard className="h-4 w-4" />
                <span className="hidden sm:inline">Shortcuts</span>
              </Button>

              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>

              <Link href="/support">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-200px)] flex flex-col">
                <CardHeader className="flex-shrink-0 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Support Conversation
                    </CardTitle>

                    {conversation && (
                      <div className="flex items-center gap-2">
                        {conversation.isComplete && (
                          <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50">
                            <CheckCircle className="h-3 w-3" />
                            Complete
                          </Badge>
                        )}
                        
                        {conversation.messages.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="gap-1"
                          >
                            <Share2 className="h-3 w-3" />
                            Share
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          className="gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar for Mobile */}
                  {conversation && (
                    <div className="md:hidden mt-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium">Conversation Progress</span>
                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <LoadingOverlay isLoading={isLoading && !conversation}>
                    <ConversationFlow
                      conversation={conversation}
                      onSendMessage={sendMessage}
                      onStartConversation={startConversation}
                      onResetConversation={resetConversation}
                      isLoading={isLoading}
                      error={error}
                      typingState={typingState}
                      className="h-full"
                      showHeader={false}
                    />
                  </LoadingOverlay>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Conversation Summary */}
              {conversation && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Messages</span>
                      <span className="font-medium">{conversation.messages.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className={conversation.isComplete ? 'text-green-600' : 'text-blue-600'}>
                        {conversation.isComplete ? 'Complete' : 'In Progress'}
                      </Badge>
                    </div>

                    {conversation.isComplete && (
                      <>
                        <Separator />
                        <Button
                          onClick={handleCreateTicket}
                          disabled={isCreatingTicket || !!conversation.createdTicketId}
                          className="w-full gap-2"
                        >
                          {isCreatingTicket ? (
                            <LoadingSpinner size="sm" />
                          ) : conversation.createdTicketId ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          {conversation.createdTicketId 
                            ? 'Ticket Created' 
                            : isCreatingTicket 
                              ? 'Creating...' 
                              : 'Create Ticket'
                          }
                        </Button>

                        {conversation.createdTicketId && (
                          <Link href="/support">
                            <Button variant="outline" className="w-full gap-2">
                              <Users className="h-4 w-4" />
                              View in Dashboard
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Support Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg Response</p>
                      <p className="text-xs text-muted-foreground"> 2 minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Satisfaction</p>
                      <p className="text-xs text-muted-foreground">98% positive</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Resolution</p>
                      <p className="text-xs text-muted-foreground">24/7 support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-900">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-800 mb-3">
                    Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">?</kbd> for keyboard shortcuts
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    Use <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+K</kbd> for command palette
                  </p>
                  <Link href="/support">
                    <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                      View All Tickets
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        commands={commands}
      />
    </div>
  );
} 