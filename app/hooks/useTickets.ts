import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Ticket,
  TicketFilter,
  TicketStats,
  TicketStatusType,
  TicketCategoryType,
  UpdateTicketData,
} from '../types/ticket';
import {
  GetTicketsRequest,
  Pagination,
} from '../types/api';
import { ticketAPI, handleApiResponse } from '../lib/api';
import { debounce } from '../lib/utils';

type SortByType = 'createdAt' | 'updatedAt' | 'priority' | 'status';
type SortOrderType = 'asc' | 'desc';

interface UseTicketsReturn {
  // Data
  tickets: Ticket[];
  filteredTickets: Ticket[];
  stats: TicketStats | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: Pagination;
  hasMore: boolean;
  
  // Filters & Search
  filters: TicketFilter;
  searchQuery: string;
  sortBy: SortByType;
  sortOrder: SortOrderType;
  
  // Actions
  loadTickets: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  updateTicket: (id: string, updates: UpdateTicketData) => Promise<boolean>;
  
  // Filters
  setFilters: (filters: Partial<TicketFilter>) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: SortByType, sortOrder: SortOrderType) => void;
  clearFilters: () => void;
  
  // Utilities
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsByStatus: (status: TicketStatusType) => Ticket[];
  getTicketsByCategory: (category: TicketCategoryType) => Ticket[];
}

const DEFAULT_PAGE_SIZE = 20;
const DEBOUNCE_DELAY = 300; // ms

const DEFAULT_FILTERS: TicketFilter = {};

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

export const useTickets = (): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  
  // Filters and sorting
  const [filters, setFiltersState] = useState<TicketFilter>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQueryState] = useState('');
  const [sortBy, setSortByState] = useState<SortByType>('createdAt');
  const [sortOrder, setSortOrderState] = useState<SortOrderType>('desc');

  // Debounced search to avoid too many API calls
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      loadTickets(true);
    }, DEBOUNCE_DELAY),
    []
  );

  // Load tickets from API
  const loadTickets = useCallback(async (reset: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: GetTicketsRequest = {
        filters: {
          ...filters,
          searchQuery: searchQuery.trim() || undefined,
        },
        pagination: {
          page: reset ? 1 : pagination.page,
          limit: DEFAULT_PAGE_SIZE,
        },
        sortBy,
        sortOrder,
      };

      const { data, error: apiError } = await handleApiResponse(() => 
        ticketAPI.getAll(params)
      );

      if (apiError) {
        setError(apiError.message);
        return;
      }

      if (data) {
        const newTickets = data.data.data;
        const newPagination = data.data.pagination;

        if (reset) {
          setTickets(newTickets);
        } else {
          // Append for pagination
          setTickets(prev => [...prev, ...newTickets]);
        }

        setPagination(newPagination);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tickets';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, sortBy, sortOrder, pagination.page]);

  // Load more tickets (pagination)
  const loadMore = useCallback(async () => {
    if (!pagination.hasNext || isLoading) return;

    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    await loadTickets(false);
  }, [pagination.hasNext, isLoading, loadTickets]);

  // Refresh tickets (reload from beginning)
  const refreshTickets = useCallback(async () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    await loadTickets(true);
  }, [loadTickets]);

  // Update a specific ticket
  const updateTicket = useCallback(async (id: string, updates: UpdateTicketData): Promise<boolean> => {
    setError(null);

    try {
      const { data, error: apiError } = await handleApiResponse(() =>
        ticketAPI.update(id, updates)
      );

      if (apiError) {
        setError(apiError.message);
        return false;
      }

      if (data) {
        // Update local state
        setTickets(prev => 
          prev.map(ticket => 
            ticket.id === id ? data.data : ticket
          )
        );
        return true;
      }

      return false;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Load ticket statistics
  const loadStats = useCallback(async () => {
    try {
      const { data, error: apiError } = await handleApiResponse(() =>
        ticketAPI.getStats({ filters })
      );

      if (apiError) {
        console.warn('Failed to load ticket stats:', apiError.message);
        return;
      }

      if (data) {
        setStats(data.data);
      }

    } catch (err) {
      console.warn('Failed to load ticket stats:', err);
    }
  }, [filters]);

  // Filter and search management
  const setFilters = useCallback((newFilters: Partial<TicketFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setPagination(prev => ({ ...prev, page: 1 }));
    debouncedSearch(query);
  }, [debouncedSearch]);

  const setSorting = useCallback((
    newSortBy: SortByType, 
    newSortOrder: SortOrderType
  ) => {
    setSortByState(newSortBy);
    setSortOrderState(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSearchQueryState('');
    setSortByState('createdAt');
    setSortOrderState('desc');
    setPagination(DEFAULT_PAGINATION);
  }, []);

  // Utility functions
  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  }, [tickets]);

  const getTicketsByStatus = useCallback((status: TicketStatusType): Ticket[] => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  const getTicketsByCategory = useCallback((category: TicketCategoryType): Ticket[] => {
    return tickets.filter(ticket => ticket.category === category);
  }, [tickets]);

  // Filter tickets locally for immediate feedback
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    // Apply status filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(ticket => filters.status!.includes(ticket.status));
    }

    // Apply category filters
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(ticket => filters.category!.includes(ticket.category));
    }

    // Apply priority filters
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(ticket => filters.priority!.includes(ticket.priority));
    }

    // Apply assigned to filter
    if (filters.assignedTo) {
      filtered = filtered.filter(ticket => ticket.assignedTo === filters.assignedTo);
    }

    // Apply search query locally for immediate feedback
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.userName.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tickets, filters, searchQuery]);

  // Load initial data
  useEffect(() => {
    loadTickets(true);
    loadStats();
  }, [filters, sortBy, sortOrder]); // Reload when filters or sorting change

  // Calculate hasMore for pagination
  const hasMore = useMemo(() => {
    return Boolean(pagination.hasNext) && !isLoading;
  }, [pagination.hasNext, isLoading]);

  return {
    // Data
    tickets,
    filteredTickets,
    stats,
    
    // State
    isLoading,
    error,
    
    // Pagination
    pagination,
    hasMore,
    
    // Filters & Search
    filters,
    searchQuery,
    sortBy,
    sortOrder,
    
    // Actions
    loadTickets,
    loadMore,
    refreshTickets,
    updateTicket,
    
    // Filters
    setFilters,
    setSearchQuery,
    setSorting,
    clearFilters,
    
    // Utilities
    getTicketById,
    getTicketsByStatus,
    getTicketsByCategory,
  };
}; 