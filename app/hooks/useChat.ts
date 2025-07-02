import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ConversationState,
  ConversationStep,
  TypingState,
} from '../types/chat';
import {
  initializeConversation,
  createTicketFromConversation,
  getConversationSummary,
} from '../lib/assistantLogic';
import { chatAPI, ticketAPI, handleApiResponse } from '../lib/api';
import { getFromStorage, setToStorage } from '../lib/utils';

interface UseChatReturn {
  // State
  conversation: ConversationState | null;
  isLoading: boolean;
  error: string | null;
  typingState: TypingState;
  
  // Actions
  startConversation: () => void;
  sendMessage: (message: string) => Promise<void>;
  resetConversation: () => void;
  createTicket: () => Promise<{ success: boolean; ticketId?: string; error?: string }>;
  
  // Utilities
  getProgress: () => number;
  getSummary: () => ReturnType<typeof getConversationSummary>;
  canSendMessage: () => boolean;
}

const STORAGE_KEY = 'support-chat-conversation';
const ASSISTANT_TYPING_DURATION = 2000; // ms

export const useChat = (): UseChatReturn => {
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingState, setTypingState] = useState<TypingState>({
    isTyping: false,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const assistantTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversation from storage on mount
  useEffect(() => {
    const savedConversation = getFromStorage<ConversationState | null>(STORAGE_KEY, null);
    if (savedConversation) {
      // Ensure dates are properly converted from strings
      const restoredConversation: ConversationState = {
        ...savedConversation,
        startedAt: new Date(savedConversation.startedAt),
        completedAt: savedConversation.completedAt ? new Date(savedConversation.completedAt) : undefined,
        messages: savedConversation.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
      setConversation(restoredConversation);
    }
  }, []);

  // Save conversation to storage whenever it changes
  useEffect(() => {
    if (conversation) {
      setToStorage(STORAGE_KEY, conversation);
    }
  }, [conversation]);

  // Clear typing timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (assistantTypingTimeoutRef.current) {
        clearTimeout(assistantTypingTimeoutRef.current);
      }
    };
  }, []);

  const startConversation = useCallback(() => {
    const newConversation = initializeConversation();
    setConversation(newConversation);
    setError(null);
  }, []);

  const showAssistantTyping = useCallback((duration: number = ASSISTANT_TYPING_DURATION) => {
    setTypingState({
      isTyping: true,
      message: 'Assistant is typing...',
      estimatedDuration: duration,
    });

    if (assistantTypingTimeoutRef.current) {
      clearTimeout(assistantTypingTimeoutRef.current);
    }

    assistantTypingTimeoutRef.current = setTimeout(() => {
      setTypingState({ isTyping: false });
    }, duration);
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!conversation || isLoading || !message.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Show typing indicator immediately
      showAssistantTyping();

      // Send message to backend API
      const { data, error } = await handleApiResponse(() => 
        chatAPI.sendMessage({
          input: {
            message: message.trim(),
            conversationId: conversation.id,
            quickReply: false,
          },
          conversationState: conversation,
        })
      );

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        // Update conversation with backend response
        setConversation(data.data.updatedConversation);
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setTypingState({ isTyping: false });
    }
  }, [conversation, isLoading, showAssistantTyping]);

  const resetConversation = useCallback(() => {
    setConversation(null);
    setError(null);
    setTypingState({ isTyping: false });
    
    // Clear storage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear conversation from storage:', error);
    }

    // Clear timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (assistantTypingTimeoutRef.current) {
      clearTimeout(assistantTypingTimeoutRef.current);
    }
  }, []);

  const createTicket = useCallback(async (): Promise<{ success: boolean; ticketId?: string; error?: string }> => {
    if (!conversation || !conversation.isComplete) {
      return { success: false, error: 'Conversation is not complete' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const ticketData = createTicketFromConversation(conversation);
      
      const { data, error } = await handleApiResponse(() => 
        ticketAPI.create({ 
          ticket: ticketData,
          conversationId: conversation.id,
        })
      );

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data) {
        // Update conversation with the created ticket ID
        const updatedConversation: ConversationState = {
          ...conversation,
          createdTicketId: data.data.id,
        };
        setConversation(updatedConversation);

        return { success: true, ticketId: data.data.id };
      }

      return { success: false, error: 'Unknown error occurred' };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  const getProgress = useCallback((): number => {
    if (!conversation) return 0;
    return getConversationSummary(conversation).progress;
  }, [conversation]);

  const getSummary = useCallback(() => {
    if (!conversation) {
      return {
        progress: 0,
        isComplete: false,
      };
    }
    return getConversationSummary(conversation);
  }, [conversation]);

  const canSendMessage = useCallback((): boolean => {
    return !!(
      conversation && 
      !isLoading && 
      !typingState.isTyping &&
      conversation.currentStep !== ConversationStep.TICKET_CREATED
    );
  }, [conversation, isLoading, typingState.isTyping]);

  return {
    // State
    conversation,
    isLoading,
    error,
    typingState,
    
    // Actions
    startConversation,
    sendMessage,
    resetConversation,
    createTicket,
    
    // Utilities
    getProgress,
    getSummary,
    canSendMessage,
  };
}; 