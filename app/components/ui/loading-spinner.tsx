import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bounce';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  if (variant === 'default') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex gap-1">
          <div
            className={cn(
              'bg-current rounded-full animate-pulse',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
            )}
            style={{
              animationDelay: '0ms',
              animationDuration: '1.4s',
            }}
          />
          <div
            className={cn(
              'bg-current rounded-full animate-pulse',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
            )}
            style={{
              animationDelay: '200ms',
              animationDuration: '1.4s',
            }}
          />
          <div
            className={cn(
              'bg-current rounded-full animate-pulse',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
            )}
            style={{
              animationDelay: '400ms',
              animationDuration: '1.4s',
            }}
          />
        </div>
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'bg-current rounded-full animate-pulse',
            sizeClasses[size]
          )}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex gap-1">
          <div
            className={cn(
              'bg-current rounded-full animate-bounce',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
            )}
            style={{
              animationDelay: '0ms',
            }}
          />
          <div
            className={cn(
              'bg-current rounded-full animate-bounce',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
            )}
            style={{
              animationDelay: '100ms',
            }}
          />
          <div
            className={cn(
              'bg-current rounded-full animate-bounce',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
            )}
            style={{
              animationDelay: '200ms',
            }}
          />
        </div>
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return null;
};

// Page-level loading component
export const PageLoadingSpinner: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Loading...', className }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px] gap-4', className)}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
};

// Overlay loading component
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}> = ({ isLoading, text = 'Loading...', children }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}; 