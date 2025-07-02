import { z } from 'zod';
import { TicketSchema, CreateTicketSchema, UpdateTicketSchema, TicketFilterSchema, TicketStatsSchema } from './ticket';
import { ConversationStateSchema, ChatInputSchema, AIResponseSchema } from './chat';

// Base API Response Schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
};

// Error Types
export const ApiErrorType = {
  VALIDATION_ERROR: 'validation_error',
  NOT_FOUND: 'not_found',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  INTERNAL_ERROR: 'internal_error',
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
} as const;

export type ApiErrorTypeType = typeof ApiErrorType[keyof typeof ApiErrorType];

export const ApiErrorSchema = z.object({
  type: z.enum(['validation_error', 'not_found', 'unauthorized', 'forbidden', 'internal_error', 'network_error', 'timeout']),
  message: z.string(),
  details: z.record(z.any()).optional(),
  code: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
  totalPages: z.number().optional(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Paginated Response Schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  data: z.array(itemSchema),
  pagination: PaginationSchema,
});

// Ticket API Endpoints

// GET /api/tickets
export const GetTicketsRequestSchema = z.object({
  filters: TicketFilterSchema.optional(),
  pagination: PaginationSchema.optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GetTicketsRequest = z.infer<typeof GetTicketsRequestSchema>;

export const GetTicketsResponseSchema = z.object({
  success: z.literal(true),
  data: PaginatedResponseSchema(TicketSchema),
  timestamp: z.date(),
});

export type GetTicketsResponse = z.infer<typeof GetTicketsResponseSchema>;

// GET /api/tickets/:id
export const GetTicketRequestSchema = z.object({
  id: z.string().uuid(),
});

export type GetTicketRequest = z.infer<typeof GetTicketRequestSchema>;

export const GetTicketResponseSchema = z.object({
  success: z.literal(true),
  data: TicketSchema,
  timestamp: z.date(),
});

export type GetTicketResponse = z.infer<typeof GetTicketResponseSchema>;

// POST /api/tickets
export const CreateTicketRequestSchema = z.object({
  ticket: CreateTicketSchema,
  conversationId: z.string().uuid().optional(),
});

export type CreateTicketRequest = z.infer<typeof CreateTicketRequestSchema>;

export const CreateTicketResponseSchema = z.object({
  success: z.literal(true),
  data: TicketSchema,
  message: z.string().optional(),
  timestamp: z.date(),
});

export type CreateTicketResponse = z.infer<typeof CreateTicketResponseSchema>;

// PATCH /api/tickets/:id
export const UpdateTicketRequestSchema = z.object({
  id: z.string().uuid(),
  updates: UpdateTicketSchema,
});

export type UpdateTicketRequest = z.infer<typeof UpdateTicketRequestSchema>;

export const UpdateTicketResponseSchema = z.object({
  success: z.literal(true),
  data: TicketSchema,
  timestamp: z.date(),
});

export type UpdateTicketResponse = z.infer<typeof UpdateTicketResponseSchema>;

// Chat/Conversation API Endpoints

// POST /api/chat/message
export const SendMessageRequestSchema = z.object({
  input: ChatInputSchema,
  conversationState: ConversationStateSchema.optional(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendMessageResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    assistantResponse: AIResponseSchema,
    updatedConversation: ConversationStateSchema,
    suggestedCategory: z.string().optional(),
  }),
  timestamp: z.date(),
});

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;

// GET /api/chat/conversations/:id
export const GetConversationRequestSchema = z.object({
  id: z.string().uuid(),
});

export type GetConversationRequest = z.infer<typeof GetConversationRequestSchema>;

export const GetConversationResponseSchema = z.object({
  success: z.literal(true),
  data: ConversationStateSchema,
  timestamp: z.date(),
});

export type GetConversationResponse = z.infer<typeof GetConversationResponseSchema>;

// Stats API Endpoints

// GET /api/stats/tickets
export const GetTicketStatsRequestSchema = z.object({
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  filters: TicketFilterSchema.optional(),
});

export type GetTicketStatsRequest = z.infer<typeof GetTicketStatsRequestSchema>;

export const GetTicketStatsResponseSchema = z.object({
  success: z.literal(true),
  data: TicketStatsSchema,
  timestamp: z.date(),
});

export type GetTicketStatsResponse = z.infer<typeof GetTicketStatsResponseSchema>;

// HTTP Methods for type safety
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethodType = typeof HttpMethod[keyof typeof HttpMethod];

// API Endpoint Configuration
export const API_ENDPOINTS = {
  // Tickets
  TICKETS: '/tickets',
  TICKET_BY_ID: (id: string) => `/tickets/${id}`,
  TICKET_STATS: '/stats/tickets',
  
  // Chat/Conversations  
  SEND_MESSAGE: '/chat/message',
  CONVERSATION_BY_ID: (id: string) => `/chat/conversations/${id}`,
  
  // Health Check
  HEALTH: '/health',
} as const;

// Request Configuration Schema
export const RequestConfigSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  headers: z.record(z.string()).optional(),
  timeout: z.number().optional(),
  retries: z.number().min(0).max(5).default(1),
  retryDelay: z.number().min(0).default(1000), // milliseconds
});

export type RequestConfig = z.infer<typeof RequestConfigSchema>;

// WebSocket Message Types (for real-time features)
export const WebSocketMessageType = {
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  CONVERSATION_UPDATE: 'conversation_update', 
  TYPING_INDICATOR: 'typing_indicator',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
} as const;

export type WebSocketMessageTypeType = typeof WebSocketMessageType[keyof typeof WebSocketMessageType];

export const WebSocketMessageSchema = z.object({
  type: z.enum(['ticket_created', 'ticket_updated', 'conversation_update', 'typing_indicator', 'error', 'ping', 'pong']),
  payload: z.any().optional(),
  timestamp: z.date().default(() => new Date()),
  id: z.string().optional(),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Upload/File Types (if needed for attachments)
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/pdf']),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// Rate Limiting Types
export const RateLimitSchema = z.object({
  requests: z.number(),
  windowMs: z.number(),
  remaining: z.number(),
  resetTime: z.date(),
});

export type RateLimit = z.infer<typeof RateLimitSchema>;

// Helper function for creating typed API responses
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> => ({
  success,
  data,
  error,
  message,
  timestamp: new Date(),
});

// Helper function for creating API errors
export const createApiError = (
  type: ApiErrorTypeType,
  message: string,
  details?: Record<string, any>,
  code?: string
): ApiError => ({
  type,
  message,
  details,
  code,
  timestamp: new Date(),
});

// Environment Configuration Schema
export const ApiConfigSchema = z.object({
  baseUrl: z.string().url(),
  timeout: z.number().default(30000),
  retries: z.number().default(1),
  apiKey: z.string().optional(),
  version: z.string().default('v1'),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>; 