import { 
  ApiError, 
  ApiErrorType,
  ApiErrorTypeType,
  createApiError,
  HttpMethodType,
  API_ENDPOINTS,
  type GetTicketsRequest,
  type GetTicketsResponse,
  type GetTicketResponse,
  type CreateTicketRequest,
  type CreateTicketResponse,
  type UpdateTicketRequest,
  type UpdateTicketResponse,
  type SendMessageRequest,
  type SendMessageResponse,
  type GetConversationResponse,
  type GetTicketStatsRequest,
  type GetTicketStatsResponse,
} from '../types/api';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  retries: 1,
  version: 'v1',
};

// Custom API Error class
export class ApiClientError extends Error {
  public readonly type: ApiErrorTypeType;
  public readonly details?: Record<string, any>;
  public readonly code?: string;
  public readonly status?: number;

  constructor(error: ApiError, status?: number) {
    super(error.message);
    this.name = 'ApiClientError';
    this.type = error.type as ApiErrorTypeType;
    this.details = error.details;
    this.code = error.code;
    this.status = status;
  }
}

// Sleep utility for retry delays
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Core API Client Class
class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Generic request method with retry logic and error handling
  private async request<T>(
    endpoint: string,
    options: {
      method?: HttpMethodType;
      data?: any;
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      data,
      headers = {},
      timeout = this.timeout,
      retries = API_CONFIG.retries,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Request configuration
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestConfig.body = JSON.stringify(data);
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig);
        
        // Handle response
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          const apiError = createApiError(
            this.getErrorType(response.status),
            errorData.message || response.statusText || 'Request failed',
            errorData.details,
            errorData.code
          );

          throw new ApiClientError(apiError, response.status);
        }

        // Parse successful response
        const responseData = await response.json();
        return responseData as T;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or the last attempt
        if (error instanceof ApiClientError && error.status && error.status < 500) {
          throw error;
        }
        
        if (attempt === retries) {
          break;
        }

        // Wait before retry
        await sleep(1000 * (attempt + 1));
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof ApiClientError) {
      throw lastError;
    }

    // Handle network or other errors
    const networkError = createApiError(
      ApiErrorType.NETWORK_ERROR,
      lastError?.message || 'Network request failed',
      { originalError: lastError?.name }
    );
    
    throw new ApiClientError(networkError);
  }

  // Map HTTP status codes to error types
  private getErrorType(status: number): ApiErrorTypeType {
    switch (true) {
      case status === 400:
        return ApiErrorType.VALIDATION_ERROR;
      case status === 401:
        return ApiErrorType.UNAUTHORIZED;
      case status === 403:
        return ApiErrorType.FORBIDDEN;
      case status === 404:
        return ApiErrorType.NOT_FOUND;
      case status === 408:
        return ApiErrorType.TIMEOUT;
      case status >= 500:
        return ApiErrorType.INTERNAL_ERROR;
      default:
        return ApiErrorType.INTERNAL_ERROR;
    }
  }

  // Ticket API Methods

  async getTickets(params?: GetTicketsRequest): Promise<GetTicketsResponse> {
    const searchParams = new URLSearchParams();
    
    // Handle filters as individual query parameters
    if (params?.filters) {
      const { status, priority, category, assignedTo, searchQuery } = params.filters;
      if (status && status.length > 0) {
        searchParams.set('status', status.join(','));
      }
      if (priority && priority.length > 0) {
        searchParams.set('priority', priority.join(','));
      }
      if (category && category.length > 0) {
        searchParams.set('category', category.join(','));
      }
      if (assignedTo) {
        searchParams.set('assignedTo', assignedTo);
      }
      if (searchQuery) {
        searchParams.set('searchQuery', searchQuery);
      }
    }
    
    // Handle pagination
    if (params?.pagination) {
      Object.entries(params.pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString());
        }
      });
    }
    
    // Handle sorting
    if (params?.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params?.sortOrder) {
      searchParams.set('sortOrder', params.sortOrder);
    }

    const endpoint = `${API_ENDPOINTS.TICKETS}?${searchParams.toString()}`;
    return this.request<GetTicketsResponse>(endpoint);
  }

  async getTicket(id: string): Promise<GetTicketResponse> {
    return this.request<GetTicketResponse>(API_ENDPOINTS.TICKET_BY_ID(id));
  }

  async createTicket(data: CreateTicketRequest): Promise<CreateTicketResponse> {
    return this.request<CreateTicketResponse>(API_ENDPOINTS.TICKETS, {
      method: 'POST',
      data,
    });
  }

  async updateTicket(id: string, updates: UpdateTicketRequest['updates']): Promise<UpdateTicketResponse> {
    return this.request<UpdateTicketResponse>(API_ENDPOINTS.TICKET_BY_ID(id), {
      method: 'PATCH',
      data: { updates },
    });
  }

  // Chat API Methods

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      data,
    });
  }

  async getConversation(id: string): Promise<GetConversationResponse> {
    return this.request<GetConversationResponse>(API_ENDPOINTS.CONVERSATION_BY_ID(id));
  }

  // Stats API Methods

  async getTicketStats(params?: GetTicketStatsRequest): Promise<GetTicketStatsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.dateFrom) {
      searchParams.set('dateFrom', params.dateFrom.toISOString());
    }
    if (params?.dateTo) {
      searchParams.set('dateTo', params.dateTo.toISOString());
    }
    
    // Handle filters as individual parameters (same as getTickets)
    if (params?.filters) {
      const { status, priority, category } = params.filters;
      if (status && status.length > 0) {
        searchParams.set('status', status.join(','));
      }
      if (priority && priority.length > 0) {
        searchParams.set('priority', priority.join(','));
      }
      if (category && category.length > 0) {
        searchParams.set('category', category.join(','));
      }
    }

    const endpoint = `${API_ENDPOINTS.TICKET_STATS}?${searchParams.toString()}`;
    return this.request<GetTicketStatsResponse>(endpoint);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>(API_ENDPOINTS.HEALTH);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience functions for common operations

export const ticketAPI = {
  getAll: (params?: GetTicketsRequest) => apiClient.getTickets(params),
  getById: (id: string) => apiClient.getTicket(id),
  create: (data: CreateTicketRequest) => apiClient.createTicket(data),
  update: (id: string, updates: UpdateTicketRequest['updates']) => apiClient.updateTicket(id, updates),
  getStats: (params?: GetTicketStatsRequest) => apiClient.getTicketStats(params),
};

export const chatAPI = {
  sendMessage: (data: SendMessageRequest) => apiClient.sendMessage(data),
  getConversation: (id: string) => apiClient.getConversation(id),
};

// Error handling utilities
export const isApiError = (error: unknown): error is ApiClientError => {
  return error instanceof ApiClientError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const getErrorType = (error: unknown): ApiErrorTypeType => {
  if (isApiError(error)) {
    return error.type as ApiErrorTypeType;
  }
  return ApiErrorType.INTERNAL_ERROR;
};

// Response wrapper utilities
export const handleApiResponse = async <T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    if (isApiError(error)) {
      return { 
        data: null, 
        error: {
          type: error.type,
          message: error.message,
          details: error.details,
          code: error.code,
          timestamp: new Date(),
        }
      };
    }
    
    return { 
      data: null, 
      error: createApiError(
        ApiErrorType.INTERNAL_ERROR,
        getErrorMessage(error)
      )
    };
  }
};

// Export the main API client
export default apiClient;
