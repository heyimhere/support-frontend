import { z } from 'zod';

// Message Types
export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant', 
  SYSTEM: 'system',
} as const;

export type MessageRoleType = typeof MessageRole[keyof typeof MessageRole];

// Message Schema
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(), // For storing additional data
});

export type Message = z.infer<typeof MessageSchema>;

// Conversation Steps - tracks the AI assistant flow
export const ConversationStep = {
  GREETING: 'greeting',
  COLLECT_NAME: 'collect_name',
  COLLECT_ISSUE: 'collect_issue', 
  CLARIFY_DETAILS: 'clarify_details',
  SUGGEST_CATEGORY: 'suggest_category',
  CONFIRM_CATEGORY: 'confirm_category',
  FINAL_CONFIRMATION: 'final_confirmation',
  TICKET_CREATED: 'ticket_created',
  ERROR: 'error',
} as const;

export type ConversationStepType = typeof ConversationStep[keyof typeof ConversationStep];

// Conversation State Schema
export const ConversationStateSchema = z.object({
  id: z.string().uuid(),
  currentStep: z.enum([
    'greeting',
    'collect_name', 
    'collect_issue',
    'clarify_details',
    'suggest_category', 
    'confirm_category',
    'final_confirmation',
    'ticket_created',
    'error'
  ]),
  collectedData: z.object({
    userName: z.string().optional(),
    userEmail: z.string().email().optional(),
    issueDescription: z.string().optional(),
    issueTitle: z.string().optional(),
    suggestedCategory: z.string().optional(),
    confirmedCategory: z.string().optional(),
    additionalDetails: z.array(z.string()).default([]),
  }),
  messages: z.array(MessageSchema),
  isComplete: z.boolean().default(false),
  createdTicketId: z.string().uuid().optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
});

export type ConversationState = z.infer<typeof ConversationStateSchema>;

// AI Response Types
export const AIResponseTypeSchema = z.enum([
  'question',           // Ask user a question
  'clarification',      // Ask for clarification
  'category_suggestion', // Suggest ticket category
  'confirmation',       // Confirm collected information
  'success',           // Ticket created successfully 
  'error',             // Error occurred
  'typing',            // Typing indicator
]);

export type AIResponseType = z.infer<typeof AIResponseTypeSchema>;

// AI Response Schema
export const AIResponseSchema = z.object({
  type: AIResponseTypeSchema,
  content: z.string(),
  nextStep: z.enum([
    'greeting',
    'collect_name',
    'collect_issue', 
    'clarify_details',
    'suggest_category',
    'confirm_category',
    'final_confirmation',
    'ticket_created',
    'error'
  ]).optional(),
  suggestions: z.array(z.string()).optional(), // Quick reply suggestions
  categoryOptions: z.array(z.string()).optional(), // Category suggestions
  requiresInput: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// Chat Input Types
export const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().uuid(),
  quickReply: z.boolean().default(false), // If using a suggested quick reply
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

// Typing Indicator State
export const TypingStateSchema = z.object({
  isTyping: z.boolean(),
  message: z.string().optional(), // What the assistant is "typing"
  estimatedDuration: z.number().optional(), // milliseconds
});

export type TypingState = z.infer<typeof TypingStateSchema>;

// Conversation Analytics
export const ConversationAnalyticsSchema = z.object({
  totalMessages: z.number(),
  userMessages: z.number(),
  assistantMessages: z.number(),
  conversationDuration: z.number(), // milliseconds
  stepsCompleted: z.number(),
  retryCount: z.number(), // How many times user had to retry answers
  satisfactionRating: z.number().min(1).max(5).optional(),
});

export type ConversationAnalytics = z.infer<typeof ConversationAnalyticsSchema>;

// Pre-defined AI responses and questions
export const AI_PROMPTS = {
  GREETING: "Hi there! 👋 I'm here to help you create a support ticket. To get started, could you please tell me your name?",
  
  COLLECT_ISSUE: (name: string) => 
    `Nice to meet you, ${name}! Now, could you please describe the issue you're experiencing? Be as detailed as possible - this will help our support team assist you better.`,
  
  CLARIFY_DETAILS: "Thank you for that information. Could you provide any additional details that might help us understand the issue better? For example, when did this start happening, or what steps led to this issue?",
  
  SUGGEST_CATEGORY: (suggestedCategory: string) => 
    `Based on your description, this seems like a **${suggestedCategory}** issue. Does this sound right to you? You can confirm this category or let me know if you think it should be categorized differently.`,
  
  FINAL_CONFIRMATION: (data: { userName: string; issueTitle: string; category: string }) =>
    `Perfect! Let me confirm the details for your support ticket:

**Name:** ${data.userName}
**Issue:** ${data.issueTitle}
**Category:** ${data.category}

Does everything look correct? If yes, I'll create your support ticket right away!`,
  
  TICKET_CREATED: (ticketId: string) =>
    `✅ Great! Your support ticket has been created successfully.

**Ticket ID:** ${ticketId}

Our support team will review your ticket and get back to you soon. You can reference this ticket ID in any future communications.

Is there anything else I can help you with today?`,
  
  ERROR: "I apologize, but something went wrong. Let me try to help you in a different way. Could you please tell me what you were trying to do?",
  
  INVALID_INPUT: "I didn't quite understand that. Could you please rephrase your response?",
  
  CATEGORY_OPTIONS: [
    "Technical Issue",
    "Billing & Payments", 
    "Account Management",
    "Feature Request",
    "Bug Report",
    "General Inquiry",
    "Other"
  ],
  
  QUICK_REPLIES: {
    YES: ["Yes", "Correct", "That's right"],
    NO: ["No", "Not quite", "Different category"],
    CONTINUE: ["Continue", "Next", "Proceed"],
    START_OVER: ["Start over", "Reset", "Begin again"],
  }
} as const;

// Helper functions for conversation management
export const getNextStep = (currentStep: ConversationStepType, userInput: string): ConversationStepType => {
  switch (currentStep) {
    case ConversationStep.GREETING:
      return ConversationStep.COLLECT_NAME;
    case ConversationStep.COLLECT_NAME:
      return ConversationStep.COLLECT_ISSUE;
    case ConversationStep.COLLECT_ISSUE:
      return ConversationStep.CLARIFY_DETAILS;
    case ConversationStep.CLARIFY_DETAILS:
      return ConversationStep.SUGGEST_CATEGORY;
    case ConversationStep.SUGGEST_CATEGORY:
      return ConversationStep.CONFIRM_CATEGORY;
    case ConversationStep.CONFIRM_CATEGORY:
      return ConversationStep.FINAL_CONFIRMATION;
    case ConversationStep.FINAL_CONFIRMATION:
      return ConversationStep.TICKET_CREATED;
    default:
      return currentStep;
  }
};

export const isConversationComplete = (step: ConversationStepType): boolean => {
  return step === ConversationStep.TICKET_CREATED;
};

export const getProgressPercentage = (step: ConversationStepType): number => {
  // Handle error state separately
  if (step === ConversationStep.ERROR) {
    return 0;
  }
  
  const stepOrder = [
    ConversationStep.GREETING,
    ConversationStep.COLLECT_NAME,
    ConversationStep.COLLECT_ISSUE,
    ConversationStep.CLARIFY_DETAILS,
    ConversationStep.SUGGEST_CATEGORY,
    ConversationStep.CONFIRM_CATEGORY,
    ConversationStep.FINAL_CONFIRMATION,
    ConversationStep.TICKET_CREATED,
  ];
  
  const currentIndex = stepOrder.indexOf(step);
  return currentIndex >= 0 ? Math.round((currentIndex / (stepOrder.length - 1)) * 100) : 0;
}; 