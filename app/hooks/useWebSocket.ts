import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connect: (userType: 'user' | 'support', userId?: string) => void;
  disconnect: () => void;
  
  // Message handling
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  
  // Utility methods
  sendTypingStart: (conversationId: string, userName?: string) => void;
  sendTypingStop: (conversationId: string) => void;
  sendTicketCreated: (ticket: any, conversationId?: string) => void;
  sendTicketUpdated: (ticketId: string, updates: any, updatedBy?: string) => void;
  sendConversationUpdate: (conversationId: string, step: string, progress: number) => void;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  userType?: 'user' | 'support';
  userId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  onTicketCreated?: (data: any) => void;
  onTicketUpdated?: (data: any) => void;
  onTypingIndicator?: (data: any) => void;
  onConversationUpdate?: (data: any) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    autoConnect = false,
    userType = 'user',
    userId,
    onConnect,
    onDisconnect,
    onError,
    onTicketCreated,
    onTicketUpdated,
    onTypingIndicator,
    onConversationUpdate,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const eventHandlersRef = useRef<Map<string, Function[]>>(new Map());
  
  // Store callbacks in refs to prevent recreating connect function
  const callbacksRef = useRef({
    onConnect,
    onDisconnect,
    onError,
    onTicketCreated,
    onTicketUpdated,
    onTypingIndicator,
    onConversationUpdate,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onConnect,
      onDisconnect,
      onError,
      onTicketCreated,
      onTicketUpdated,
      onTypingIndicator,
      onConversationUpdate,
    };
  });

  // Connect to WebSocket server
  const connect = useCallback((userType: 'user' | 'support', userId?: string) => {
    if (socketRef.current?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('✅ WebSocket connected:', socket.id);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        
        // Join user type room
        socket.emit('join', { type: userType, userId });
        
        callbacksRef.current.onConnect?.();
      });

      socket.on('disconnect', (reason) => {
        console.log('🔴 WebSocket disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        callbacksRef.current.onDisconnect?.();
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        const errorMessage = `Connection failed: ${error.message}`;
        setError(errorMessage);
        setIsConnecting(false);
        callbacksRef.current.onError?.(errorMessage);
      });

      // Connection confirmation
      socket.on('connection-confirmed', (data) => {
        console.log('🤝 Connection confirmed:', data);
      });

      // Real-time event handlers
      socket.on('ticket-created', (message: any) => {
        console.log('🎫 Ticket created:', message.data);
        callbacksRef.current.onTicketCreated?.(message.data);
      });

      socket.on('ticket-updated', (message: any) => {
        console.log('📝 Ticket updated:', message.data);
        callbacksRef.current.onTicketUpdated?.(message.data);
      });

      socket.on('typing-indicator', (message: any) => {
        callbacksRef.current.onTypingIndicator?.(message.data);
      });

      socket.on('conversation-update', (message: any) => {
        callbacksRef.current.onConversationUpdate?.(message.data);
      });

      socket.on('user-connected', (message: any) => {
        console.log('👤 User connected:', message.data);
      });

      socket.on('user-disconnected', (message: any) => {
        console.log('👤 User disconnected:', message.data);
      });

      socket.on('server-stats', (message: any) => {
        console.log('📊 Server stats:', message.data);
      });

      socket.on('error', (message: any) => {
        console.error('⚠️ WebSocket error:', message.data);
        const errorMessage = message.data?.message || 'Unknown WebSocket error';
        setError(errorMessage);
        callbacksRef.current.onError?.(errorMessage);
      });

      // Ping/Pong for connection health
      socket.on('pong', (message: any) => {
        // Connection is healthy
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnecting(false);
      callbacksRef.current.onError?.(errorMessage);
    }
    // Remove all callback dependencies to prevent infinite recreations
  }, []);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, []);

  // Generic emit function
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }, []);

  // Generic event listener management
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      
      // Track handlers for cleanup
      const handlers = eventHandlersRef.current.get(event) || [];
      handlers.push(handler);
      eventHandlersRef.current.set(event, handlers);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
        
        // Remove from tracked handlers
        const handlers = eventHandlersRef.current.get(event) || [];
        const filteredHandlers = handlers.filter(h => h !== handler);
        eventHandlersRef.current.set(event, filteredHandlers);
      } else {
        socketRef.current.off(event);
        eventHandlersRef.current.delete(event);
      }
    }
  }, []);

  // Specific utility methods
  const sendTypingStart = useCallback((conversationId: string, userName?: string) => {
    emit('typing-start', { conversationId, userName });
  }, [emit]);

  const sendTypingStop = useCallback((conversationId: string) => {
    emit('typing-stop', { conversationId });
  }, [emit]);

  const sendTicketCreated = useCallback((ticket: any, conversationId?: string) => {
    emit('ticket-created', { ticket, conversationId });
  }, [emit]);

  const sendTicketUpdated = useCallback((ticketId: string, updates: any, updatedBy?: string) => {
    emit('ticket-updated', { ticketId, updates, updatedBy });
  }, [emit]);

  const sendConversationUpdate = useCallback((conversationId: string, step: string, progress: number) => {
    emit('conversation-update', { conversationId, step, progress });
  }, [emit]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect(userType, userId);
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
    // Remove connect and disconnect from dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, userType, userId]);

  // Send periodic pings to maintain connection
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        emit('ping', { timestamp: new Date().toISOString() });
      }, 30000); // Every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, emit]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Actions
    connect,
    disconnect,
    
    // Message handling
    emit,
    on,
    off,
    
    // Utility methods
    sendTypingStart,
    sendTypingStop,
    sendTicketCreated,
    sendTicketUpdated,
    sendConversationUpdate,
  };
}; 