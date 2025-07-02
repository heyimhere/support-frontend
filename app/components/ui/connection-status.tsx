import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastActivity?: Date | null;
  className?: string;
  showText?: boolean;
  compact?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  lastActivity,
  className,
  showText = true,
  compact = false,
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          text: 'Connecting...',
          animate: 'animate-spin',
        };
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-600 bg-green-50 border-green-200',
          text: 'Connected',
          animate: '',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          text: 'Disconnected',
          animate: '',
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-600 bg-red-50 border-red-200',
          text: 'Connection Error',
          animate: '',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          text: 'Unknown',
          animate: '',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const formatLastActivity = () => {
    if (!lastActivity) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastActivity.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastActivity.toLocaleDateString();
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Icon className={cn('h-3 w-3', statusInfo.color.split(' ')[0], statusInfo.animate)} />
        {showText && (
          <span className="text-xs text-muted-foreground">
            {statusInfo.text}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-2 font-normal',
        statusInfo.color,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', statusInfo.animate)} />
      {showText && (
        <>
          <span className="text-xs font-medium">{statusInfo.text}</span>
          {lastActivity && status === 'connected' && (
            <span className="text-xs opacity-75">
              • {formatLastActivity()}
            </span>
          )}
        </>
      )}
    </Badge>
  );
};

// Real-time status indicator that updates automatically
export const LiveConnectionStatus: React.FC<Omit<ConnectionStatusProps, 'status' | 'lastActivity'>> = (props) => {
  const [status, setStatus] = React.useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastActivity, setLastActivity] = React.useState<Date | null>(null);

  React.useEffect(() => {
    // Simulate connection status changes
    const interval = setInterval(() => {
      // Random connection simulation for demo
      const states: typeof status[] = ['connected', 'connected', 'connected', 'connecting', 'error'];
      const randomState = states[Math.floor(Math.random() * states.length)];
      
      setStatus(randomState);
      if (randomState === 'connected') {
        setLastActivity(new Date());
      }
    }, 10000); // Update every 10 seconds

    // Start connected
    setStatus('connected');
    setLastActivity(new Date());

    return () => clearInterval(interval);
  }, []);

  return (
    <ConnectionStatus
      status={status}
      lastActivity={lastActivity}
      {...props}
    />
  );
}; 