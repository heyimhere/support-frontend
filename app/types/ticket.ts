import { z } from 'zod';

// Ticket Status Enum
export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress', 
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type TicketStatusType = typeof TicketStatus[keyof typeof TicketStatus];

// Ticket Priority Enum
export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TicketPriorityType = typeof TicketPriority[keyof typeof TicketPriority];

// Pre-defined categories that can be expanded
export const TicketCategory = {
  TECHNICAL: 'technical',
  BILLING: 'billing', 
  ACCOUNT: 'account',
  FEATURE_REQUEST: 'feature_request',
  BUG_REPORT: 'bug_report',
  GENERAL: 'general',
  OTHER: 'other',
} as const;

export type TicketCategoryType = typeof TicketCategory[keyof typeof TicketCategory];

// Zod Schemas for validation
export const TicketStatusSchema = z.enum([
  'open', 
  'in_progress', 
  'resolved', 
  'closed'
]);

export const TicketPrioritySchema = z.enum([
  'low', 
  'medium', 
  'high', 
  'urgent'
]);

export const TicketCategorySchema = z.enum([
  'technical',
  'billing',
  'account', 
  'feature_request',
  'bug_report',
  'general',
  'other'
]);

// Core Ticket Schema
export const TicketSchema = z.object({
  id: z.string().uuid(),
  userName: z.string().min(1, 'User name is required'),
  userEmail: z.string().email('Valid email is required').optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'), 
  category: TicketCategorySchema,
  status: TicketStatusSchema.default('open'),
  priority: TicketPrioritySchema.default('medium'),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().optional(),
  assignedTo: z.string().optional(), // Support tech ID
  tags: z.array(z.string()).default([]),
  conversationId: z.string().uuid().optional(), // Link to chat conversation
});

// Type inference from schema
export type Ticket = z.infer<typeof TicketSchema>;

// Create Ticket Schema (for new ticket creation)
export const CreateTicketSchema = TicketSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
}).extend({
  // Allow partial data during creation process
  title: z.string().optional(),
  description: z.string().optional(),
  category: TicketCategorySchema.optional(),
});

export type CreateTicketData = z.infer<typeof CreateTicketSchema>;

// Update Ticket Schema (for support tech updates)
export const UpdateTicketSchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTicketData = z.infer<typeof UpdateTicketSchema>;

// Ticket Filter Schema (for support tech filtering)
export const TicketFilterSchema = z.object({
  status: z.array(TicketStatusSchema).optional(),
  category: z.array(TicketCategorySchema).optional(),
  priority: z.array(TicketPrioritySchema).optional(),
  assignedTo: z.string().optional(),
  searchQuery: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type TicketFilter = z.infer<typeof TicketFilterSchema>;

// Ticket Statistics Schema
export const TicketStatsSchema = z.object({
  totalTickets: z.number(),
  openTickets: z.number(),
  inProgressTickets: z.number(),
  resolvedTickets: z.number(),
  closedTickets: z.number(),
  byCategory: z.record(TicketCategorySchema, z.number()),
  byPriority: z.record(TicketPrioritySchema, z.number()),
  averageResolutionTime: z.number().optional(), // in hours
});

export type TicketStats = z.infer<typeof TicketStatsSchema>;

// Helper functions for ticket management
export const getTicketStatusColor = (status: TicketStatusType): string => {
  switch (status) {
    case TicketStatus.OPEN:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case TicketStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case TicketStatus.RESOLVED:
      return 'bg-green-100 text-green-800 border-green-200';
    case TicketStatus.CLOSED:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPriorityColor = (priority: TicketPriorityType): string => {
  switch (priority) {
    case TicketPriority.LOW:
      return 'bg-green-100 text-green-800 border-green-200';
    case TicketPriority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case TicketPriority.HIGH:
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case TicketPriority.URGENT:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getCategoryDisplayName = (category: TicketCategoryType): string => {
  switch (category) {
    case TicketCategory.TECHNICAL:
      return 'Technical Issue';
    case TicketCategory.BILLING:
      return 'Billing & Payments';
    case TicketCategory.ACCOUNT:
      return 'Account Management';
    case TicketCategory.FEATURE_REQUEST:
      return 'Feature Request';
    case TicketCategory.BUG_REPORT:
      return 'Bug Report';
    case TicketCategory.GENERAL:
      return 'General Inquiry';
    case TicketCategory.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
};
