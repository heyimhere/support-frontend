import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  showCharacterCount?: boolean;
  isLoading?: boolean;
  allowMultiline?: boolean;
  autoFocus?: boolean;
  suggestions?: string[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  maxLength = 1000,
  className,
  showCharacterCount = false,
  isLoading = false,
  allowMultiline = true,
  autoFocus = false,
  suggestions = [],
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of ~6 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Handle message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  // Handle sending message
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isLoading) {
      onSend(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, disabled, isLoading, onSend]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!allowMultiline || (!e.shiftKey && !e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    }

    // Escape to clear
    if (e.key === 'Escape') {
      setMessage('');
      textareaRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (!disabled && !isLoading) {
      onSend(suggestion);
      setMessage('');
    }
  };

  // Auto-resize effect
  useEffect(() => {
    adjustHeight();
  }, [message, adjustHeight]);

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const characterCount = message.length;
  const isOverLimit = characterCount > maxLength;
  const canSend = message.trim().length > 0 && !disabled && !isLoading && !isOverLimit;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={disabled || isLoading}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div
        className={cn(
          'relative border rounded-lg transition-all duration-200',
          isFocused && 'ring-2 ring-ring ring-offset-2',
          disabled && 'opacity-50',
          'bg-background'
        )}
      >
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'min-h-[44px] max-h-[120px] resize-none border-0 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0',
            'scrollbar-thin scrollbar-thumb-muted-foreground/20'
          )}
          style={{ height: 'auto' }}
        />

        {/* Send Button */}
        <div className="absolute right-2 bottom-2">
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'h-8 w-8 p-0 transition-all duration-200',
              canSend 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-muted-foreground/20 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {/* Keyboard Hint */}
        <div className="flex items-center gap-4">
          {allowMultiline && (
            <span>Press Enter to send, Shift+Enter for new line</span>
          )}
          <span>Press Esc to clear</span>
        </div>

        {/* Character Count */}
        {showCharacterCount && (
          <span
            className={cn(
              'tabular-nums',
              isOverLimit && 'text-destructive font-medium'
            )}
          >
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

// Simplified version for compact layouts
export const CompactChatInput: React.FC<Pick<ChatInputProps, 'onSend' | 'disabled' | 'placeholder' | 'isLoading'>> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isLoading) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={!message.trim() || disabled || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}; 