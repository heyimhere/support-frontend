import { useState, useEffect, useCallback } from 'react';
import { getFromStorage, setToStorage, removeFromStorage } from '../lib/utils';

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): UseLocalStorageReturn<T> => {
  const [value, setValueState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial value from localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      const storedValue = getFromStorage(key, defaultValue);
      setValueState(storedValue);
    } catch (err) {
      console.warn(`Failed to load from localStorage (key: ${key}):`, err);
      setError(err instanceof Error ? err.message : 'Failed to load from storage');
      setValueState(defaultValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue]);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      setError(null);
      
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      setValueState(valueToStore);
      setToStorage(key, valueToStore);
    } catch (err) {
      console.warn(`Failed to save to localStorage (key: ${key}):`, err);
      setError(err instanceof Error ? err.message : 'Failed to save to storage');
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    try {
      setError(null);
      setValueState(defaultValue);
      removeFromStorage(key);
    } catch (err) {
      console.warn(`Failed to remove from localStorage (key: ${key}):`, err);
      setError(err instanceof Error ? err.message : 'Failed to remove from storage');
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue,
    removeValue,
    isLoading,
    error,
  };
};

// Specialized hook for user preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: true,
  soundEnabled: true,
  autoRefresh: true,
  compactMode: false,
};

export const useUserPreferences = () => {
  return useLocalStorage<UserPreferences>('user-preferences', DEFAULT_PREFERENCES);
};

// Specialized hook for recently viewed tickets
export const useRecentTickets = () => {
  const { value: recentTickets, setValue, ...rest } = useLocalStorage<string[]>('recent-tickets', []);

  const addRecentTicket = useCallback((ticketId: string) => {
    setValue(prev => {
      const filtered = prev.filter(id => id !== ticketId);
      return [ticketId, ...filtered].slice(0, 10); // Keep last 10
    });
  }, [setValue]);

  const clearRecentTickets = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    recentTickets,
    addRecentTicket,
    clearRecentTickets,
    ...rest,
  };
};

// Specialized hook for draft messages
export interface DraftMessage {
  conversationId: string;
  message: string;
  timestamp: Date;
}

export const useDraftMessages = () => {
  const { value: drafts, setValue, ...rest } = useLocalStorage<Record<string, DraftMessage>>('draft-messages', {});

  const saveDraft = useCallback((conversationId: string, message: string) => {
    setValue(prev => ({
      ...prev,
      [conversationId]: {
        conversationId,
        message,
        timestamp: new Date(),
      },
    }));
  }, [setValue]);

  const getDraft = useCallback((conversationId: string): string => {
    return drafts[conversationId]?.message || '';
  }, [drafts]);

  const removeDraft = useCallback((conversationId: string) => {
    setValue(prev => {
      const { [conversationId]: removed, ...rest } = prev;
      return rest;
    });
  }, [setValue]);

  const clearOldDrafts = useCallback((olderThanHours: number = 24) => {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    setValue(prev => {
      const filtered: Record<string, DraftMessage> = {};
      
      Object.entries(prev).forEach(([id, draft]) => {
        if (new Date(draft.timestamp) > cutoff) {
          filtered[id] = draft;
        }
      });
      
      return filtered;
    });
  }, [setValue]);

  return {
    drafts,
    saveDraft,
    getDraft,
    removeDraft,
    clearOldDrafts,
    ...rest,
  };
}; 