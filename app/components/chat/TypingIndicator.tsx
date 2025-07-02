import React from 'react';
import { TypingState } from '../../types/chat';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  typingState: TypingState;
  className?: string;
  showAvatar?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingState,
  className,
  showAvatar = true,
}) => {
  if (!typingState.isTyping) return null;

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 bg-blue-500 text-white">
            <AvatarFallback className="bg-blue-500 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Typing Bubble */}
      <Card className="border shadow-sm bg-muted mr-auto max-w-[80%]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {/* Typing Animation */}
            <div className="flex gap-1">
              <div
                className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"
                style={{
                  animationDelay: '0ms',
                  animationDuration: '1.4s',
                }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"
                style={{
                  animationDelay: '200ms',
                  animationDuration: '1.4s',
                }}
              />
              <div
                className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse"
                style={{
                  animationDelay: '400ms',
                  animationDuration: '1.4s',
                }}
              />
            </div>

            {/* Typing Message */}
            {typingState.message && (
              <span className="text-sm text-muted-foreground ml-1">
                {typingState.message}
              </span>
            )}
          </div>

          {/* Progress Bar (if duration provided) */}
          {typingState.estimatedDuration && (
            <div className="mt-2">
              <div className="w-full bg-muted-foreground/20 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-linear"
                  style={{
                    animation: `progressBar ${typingState.estimatedDuration}ms linear`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

// Alternative minimal typing indicator
export const MinimalTypingIndicator: React.FC<Pick<TypingIndicatorProps, 'typingState' | 'className'>> = ({
  typingState,
  className,
}) => {
  if (!typingState.isTyping) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-200',
        className
      )}
    >
      <Bot className="h-4 w-4" />
      <span>Assistant is typing</span>
      <div className="flex gap-1">
        <div
          className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
          style={{
            animationDelay: '0ms',
            animationDuration: '1.4s',
          }}
        />
        <div
          className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
          style={{
            animationDelay: '200ms',
            animationDuration: '1.4s',
          }}
        />
        <div
          className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"
          style={{
            animationDelay: '400ms',
            animationDuration: '1.4s',
          }}
        />
      </div>
    </div>
  );
}; 