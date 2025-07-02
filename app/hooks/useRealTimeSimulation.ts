import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface RealTimeEvent {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'ticket_status_changed' | 'typing_indicator' | 'conversation_update';
  timestamp: Date;
  data: any;
}

interface UseRealTimeConnectionProps {
  enabled?: boolean;
  userType?: 'user' | 'support';
  userId?: string;
}

interface UseRealTimeConnectionReturn {
  events: RealTimeEvent[];
  isConnected: boolean;
  isConnecting: boolean;
  lastActivity: Date | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  clearEvents: () => void;
  sendTypingStart: (conversationId: string, userName?: string) => void;
  sendTypingStop: (conversationId: string) => void;
  sendTicketCreated: (ticket: any, conversationId?: string) => void;
  sendTicketUpdated: (ticketId: string, updates: any, updatedBy?: string) => void;
}

export const useRealTimeConnection = ({
  enabled = true,
  userType = 'user',
  userId,
}: UseRealTimeConnectionProps = {}): UseRealTimeConnectionReturn => {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Event handlers for WebSocket messages
  const handleTicketCreated = useCallback((data: any) => {
    const event: RealTimeEvent = {
      id: `event-${Math.random().toString(36).substring(2)}`,
      type: 'ticket_created',
      timestamp: new Date(),
      data,
    };
    setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
    setLastActivity(new Date());
  }, []);

  const handleTicketUpdated = useCallback((data: any) => {
    const event: RealTimeEvent = {
      id: `event-${Math.random().toString(36).substring(2)}`,
      type: 'ticket_updated',
      timestamp: new Date(),
      data,
    };
    setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
    setLastActivity(new Date());
  }, []);

  const handleTypingIndicator = useCallback((data: any) => {
    const event: RealTimeEvent = {
      id: `event-${Math.random().toString(36).substring(2)}`,
      type: 'typing_indicator',
      timestamp: new Date(),
      data,
    };
    setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
    setLastActivity(new Date());
  }, []);

  const handleConversationUpdate = useCallback((data: any) => {
    const event: RealTimeEvent = {
      id: `event-${Math.random().toString(36).substring(2)}`,
      type: 'conversation_update',
      timestamp: new Date(),
      data,
    };
    setEvents(prev => [...prev.slice(-49), event]); // Keep last 50 events
    setLastActivity(new Date());
  }, []);

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    error,
    sendTypingStart,
    sendTypingStop,
    sendTicketCreated,
    sendTicketUpdated,
  } = useWebSocket({
    autoConnect: enabled,
    userType,
    userId,
    onConnect: () => {
      setConnectionStatus('connected');
      setLastActivity(new Date());
    },
    onDisconnect: () => {
      setConnectionStatus('disconnected');
    },
    onError: () => {
      setConnectionStatus('error');
    },
    onTicketCreated: handleTicketCreated,
    onTicketUpdated: handleTicketUpdated,
    onTypingIndicator: handleTypingIndicator,
    onConversationUpdate: handleConversationUpdate,
  });

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus('connecting');
    } else if (isConnected) {
      setConnectionStatus('connected');
    } else if (error) {
      setConnectionStatus('error');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, isConnecting, error]);

  return {
    // Data
    events,
    isConnected,
    isConnecting,
    lastActivity,
    connectionStatus,
    error,
    
    // Actions
    clearEvents,
    sendTypingStart,
    sendTypingStop,
    sendTicketCreated,
    sendTicketUpdated,
  };
};

// Legacy export for backwards compatibility
export const useRealTimeSimulation = useRealTimeConnection;

// Specialized hooks for specific use cases
export const useTicketUpdates = (ticketIds: string[]) => {
  const { events, isConnected } = useRealTimeConnection({
    enabled: true,
    userType: 'support',
  });

  // Filter events for specific tickets
  const ticketEvents = events.filter(event => 
    (event.type === 'ticket_created' || event.type === 'ticket_updated') &&
    event.data?.ticketId && 
    ticketIds.includes(event.data.ticketId)
  );

  return {
    events: ticketEvents,
    isConnected,
    hasUpdates: ticketEvents.length > 0,
  };
};

export const useLiveStats = () => {
  const { events, isConnected } = useRealTimeConnection({
    enabled: true,
    userType: 'support',
  });

  // Calculate live statistics from events
  const stats = {
    ticketsCreatedToday: events.filter(e => 
      e.type === 'ticket_created' && 
      new Date(e.timestamp).toDateString() === new Date().toDateString()
    ).length,
    recentActivity: events.slice(-10),
    isConnected,
  };

  return stats;
}; 