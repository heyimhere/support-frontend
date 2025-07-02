import { v4 as uuidv4 } from 'uuid';
import {
  ConversationState,
  ConversationStep,
  ConversationStepType,
  Message,
  MessageRole,
  AIResponse,
  AIResponseType,
  AI_PROMPTS,
  isConversationComplete,
} from '../types/chat';
import {
  TicketCategory,
  TicketCategoryType,
  CreateTicketData,
  getCategoryDisplayName,
} from '../types/ticket';

// Initialize a new conversation
export const initializeConversation = (): ConversationState => {
  const conversationId = uuidv4();
  const now = new Date();

  const greetingMessage: Message = {
    id: uuidv4(),
    role: MessageRole.ASSISTANT,
    content: AI_PROMPTS.GREETING,
    timestamp: now,
  };

  return {
    id: conversationId,
    currentStep: ConversationStep.GREETING,
    collectedData: {
      additionalDetails: [],
    },
    messages: [greetingMessage],
    isComplete: false,
    startedAt: now,
  };
};

// Category detection using keyword matching (simplified AI logic)
export const detectCategory = (issueDescription: string): TicketCategoryType => {
  const description = issueDescription.toLowerCase();
  
  // Technical keywords
  const technicalKeywords = [
    'login', 'password', 'error', 'bug', 'crash', 'broken', 'not working',
    'server', 'loading', 'slow', 'performance', 'database', 'api',
    'website', 'app', 'system', 'connection', 'timeout', 'code'
  ];
  
  // Billing keywords
  const billingKeywords = [
    'payment', 'billing', 'charge', 'invoice', 'credit card', 'subscription',
    'refund', 'money', 'cost', 'price', 'fee', 'upgrade', 'downgrade'
  ];
  
  // Account keywords
  const accountKeywords = [
    'account', 'profile', 'settings', 'email', 'username', 'access',
    'permission', 'delete', 'update', 'change', 'modify'
  ];
  
  // Feature request keywords
  const featureKeywords = [
    'feature', 'request', 'suggest', 'improvement', 'enhancement',
    'add', 'new', 'wish', 'would like', 'could you'
  ];
  
  // Bug report keywords
  const bugKeywords = [
    'bug', 'issue', 'problem', 'error', 'glitch', 'malfunction',
    'defect', 'wrong', 'incorrect', 'unexpected'
  ];

  // Count keyword matches for each category
  const categoryScores = {
    [TicketCategory.TECHNICAL]: technicalKeywords.filter(keyword => description.includes(keyword)).length,
    [TicketCategory.BILLING]: billingKeywords.filter(keyword => description.includes(keyword)).length,
    [TicketCategory.ACCOUNT]: accountKeywords.filter(keyword => description.includes(keyword)).length,
    [TicketCategory.FEATURE_REQUEST]: featureKeywords.filter(keyword => description.includes(keyword)).length,
    [TicketCategory.BUG_REPORT]: bugKeywords.filter(keyword => description.includes(keyword)).length,
    [TicketCategory.GENERAL]: 0, // Default score for general category
    [TicketCategory.OTHER]: 0, // Default score for other category
  };

  // Find the category with the highest score
  const topCategory = Object.entries(categoryScores).reduce((a, b) => 
    categoryScores[a[0] as TicketCategoryType] > categoryScores[b[0] as TicketCategoryType] ? a : b
  );

  // Return the detected category, or GENERAL if no clear match
  return topCategory[1] > 0 ? topCategory[0] as TicketCategoryType : TicketCategory.GENERAL;
};

// Extract a meaningful title from the issue description
export const generateIssueTitle = (description: string): string => {
  // Remove extra whitespace and trim
  const cleaned = description.trim().replace(/\s+/g, ' ');
  
  // If description is short enough, use it as title
  if (cleaned.length <= 60) {
    return cleaned;
  }
  
  // Extract first sentence or first 50 characters
  const firstSentence = cleaned.split('.')[0];
  if (firstSentence.length <= 60) {
    return firstSentence;
  }
  
  // Truncate to 50 characters and add ellipsis
  return cleaned.substring(0, 50).trim() + '...';
};

// Validate user input based on conversation step
export const validateInput = (input: string, step: ConversationStepType): boolean => {
  const trimmedInput = input.trim();
  
  switch (step) {
    case ConversationStep.COLLECT_NAME:
      return trimmedInput.length >= 2 && trimmedInput.length <= 50;
    case ConversationStep.COLLECT_ISSUE:
      return trimmedInput.length >= 10;
    case ConversationStep.CLARIFY_DETAILS:
      return trimmedInput.length >= 5;
    case ConversationStep.CONFIRM_CATEGORY:
      return true; // Accept any response for category confirmation
    case ConversationStep.FINAL_CONFIRMATION:
      return true; // Accept any response for final confirmation
    default:
      return true;
  }
};

// Process user input and generate AI response
export const processUserInput = (
  userInput: string,
  currentConversation: ConversationState
): { updatedConversation: ConversationState; aiResponse: AIResponse } => {
  const trimmedInput = userInput.trim();
  const currentStep = currentConversation.currentStep;
  
  // Create user message
  const userMessage: Message = {
    id: uuidv4(),
    role: MessageRole.USER,
    content: trimmedInput,
    timestamp: new Date(),
  };

  // Update conversation with user message
  const updatedMessages = [...currentConversation.messages, userMessage];
  let updatedCollectedData = { ...currentConversation.collectedData };
  let nextStep = currentStep;
  let aiResponseContent = '';
  let aiResponseType: AIResponseType = 'question';
  let suggestions: string[] = [];
  let categoryOptions: string[] = [];

  // Process input based on current step
  switch (currentStep) {
    case ConversationStep.GREETING:
    case ConversationStep.COLLECT_NAME:
      if (validateInput(trimmedInput, ConversationStep.COLLECT_NAME)) {
        updatedCollectedData.userName = trimmedInput;
        nextStep = ConversationStep.COLLECT_ISSUE;
        aiResponseContent = AI_PROMPTS.COLLECT_ISSUE(trimmedInput);
      } else {
        aiResponseContent = "Please provide a valid name (2-50 characters).";
      }
      break;

    case ConversationStep.COLLECT_ISSUE:
      if (validateInput(trimmedInput, ConversationStep.COLLECT_ISSUE)) {
        updatedCollectedData.issueDescription = trimmedInput;
        updatedCollectedData.issueTitle = generateIssueTitle(trimmedInput);
        nextStep = ConversationStep.CLARIFY_DETAILS;
        aiResponseContent = AI_PROMPTS.CLARIFY_DETAILS;
      } else {
        aiResponseContent = "Please provide more details about your issue (at least 10 characters).";
      }
      break;

    case ConversationStep.CLARIFY_DETAILS:
      if (validateInput(trimmedInput, ConversationStep.CLARIFY_DETAILS)) {
        updatedCollectedData.additionalDetails.push(trimmedInput);
        
        // Detect category based on issue description and additional details
        const fullDescription = `${updatedCollectedData.issueDescription} ${trimmedInput}`;
        const detectedCategory = detectCategory(fullDescription);
        updatedCollectedData.suggestedCategory = detectedCategory;
        
        nextStep = ConversationStep.SUGGEST_CATEGORY;
        aiResponseContent = AI_PROMPTS.SUGGEST_CATEGORY(getCategoryDisplayName(detectedCategory));
        aiResponseType = 'category_suggestion';
        suggestions = [...AI_PROMPTS.QUICK_REPLIES.YES, ...AI_PROMPTS.QUICK_REPLIES.NO];
      } else {
        aiResponseContent = "Please provide some additional details to help us better understand your issue.";
      }
      break;

    case ConversationStep.SUGGEST_CATEGORY:
    case ConversationStep.CONFIRM_CATEGORY:
      const isPositiveResponse = /^(yes|y|correct|right|ok|okay|sure|yep|yeah)$/i.test(trimmedInput) ||
                                AI_PROMPTS.QUICK_REPLIES.YES.some(reply => 
                                  reply.toLowerCase() === trimmedInput.toLowerCase()
                                );
      
      if (isPositiveResponse) {
        // User confirmed the suggested category
        updatedCollectedData.confirmedCategory = updatedCollectedData.suggestedCategory;
        nextStep = ConversationStep.FINAL_CONFIRMATION;
        aiResponseContent = AI_PROMPTS.FINAL_CONFIRMATION({
          userName: updatedCollectedData.userName || 'User',
          issueTitle: updatedCollectedData.issueTitle || 'Support Request',
          category: getCategoryDisplayName(updatedCollectedData.suggestedCategory as TicketCategoryType),
        });
        aiResponseType = 'confirmation';
        suggestions = [...AI_PROMPTS.QUICK_REPLIES.YES, 'Make changes'];
      } else {
        // User wants a different category - show options
        nextStep = ConversationStep.CONFIRM_CATEGORY;
        aiResponseContent = "No problem! Which category would better describe your issue?";
        aiResponseType = 'category_suggestion';
        categoryOptions = [...AI_PROMPTS.CATEGORY_OPTIONS];
        
        // Check if user mentioned a specific category
        const mentionedCategory = Object.values(TicketCategory).find(category => 
          trimmedInput.toLowerCase().includes(category) ||
          trimmedInput.toLowerCase().includes(getCategoryDisplayName(category).toLowerCase())
        );
        
        if (mentionedCategory) {
          updatedCollectedData.suggestedCategory = mentionedCategory;
          updatedCollectedData.confirmedCategory = mentionedCategory;
          nextStep = ConversationStep.FINAL_CONFIRMATION;
          aiResponseContent = AI_PROMPTS.FINAL_CONFIRMATION({
            userName: updatedCollectedData.userName || 'User',
            issueTitle: updatedCollectedData.issueTitle || 'Support Request',
            category: getCategoryDisplayName(mentionedCategory),
          });
          aiResponseType = 'confirmation';
        }
      }
      break;

    case ConversationStep.FINAL_CONFIRMATION:
      const isConfirmed = /^(yes|y|correct|create|submit|ok|okay|sure|yep|yeah)$/i.test(trimmedInput) ||
                         AI_PROMPTS.QUICK_REPLIES.YES.some(reply => 
                           reply.toLowerCase() === trimmedInput.toLowerCase()
                         );
      
      if (isConfirmed) {
        nextStep = ConversationStep.TICKET_CREATED;
        const ticketId = uuidv4();
        
        aiResponseContent = AI_PROMPTS.TICKET_CREATED(ticketId);
        aiResponseType = 'success';
        
        // Mark conversation as complete
        updatedCollectedData.issueTitle = updatedCollectedData.issueTitle || 'Support Request';
        updatedCollectedData.confirmedCategory = updatedCollectedData.confirmedCategory || TicketCategory.GENERAL;
      } else {
        aiResponseContent = "What would you like to change? You can modify your name, issue description, or category.";
        nextStep = ConversationStep.COLLECT_NAME; // Allow them to start over
        suggestions = ['Change name', 'Change description', 'Change category', 'Start over'];
      }
      break;

    default:
      aiResponseContent = AI_PROMPTS.ERROR;
      aiResponseType = 'error';
  }

  // Create AI response message
  const aiMessage: Message = {
    id: uuidv4(),
    role: MessageRole.ASSISTANT,
    content: aiResponseContent,
    timestamp: new Date(),
  };

  // Create AI response
  const aiResponse: AIResponse = {
    type: aiResponseType,
    content: aiResponseContent,
    nextStep: nextStep,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    categoryOptions: categoryOptions.length > 0 ? categoryOptions : undefined,
    requiresInput: nextStep !== ConversationStep.TICKET_CREATED,
  };

  // Create updated conversation state
  const updatedConversation: ConversationState = {
    ...currentConversation,
    currentStep: nextStep,
    collectedData: updatedCollectedData,
    messages: [...updatedMessages, aiMessage],
    isComplete: isConversationComplete(nextStep),
    completedAt: isConversationComplete(nextStep) ? new Date() : undefined,
  };

  return { updatedConversation, aiResponse };
};

// Create ticket data from conversation
export const createTicketFromConversation = (conversation: ConversationState): CreateTicketData => {
  const { collectedData } = conversation;
  
  return {
    userName: collectedData.userName || 'Anonymous User',
    userEmail: undefined, // We don't collect email in this simplified flow
    title: collectedData.issueTitle || 'Support Request',
    description: `${collectedData.issueDescription || ''}\n\nAdditional Details:\n${collectedData.additionalDetails.join('\n')}`.trim(),
    category: (collectedData.confirmedCategory as TicketCategoryType) || TicketCategory.GENERAL,
    status: 'open',
    priority: 'medium',
    tags: [],
    conversationId: conversation.id,
  };
};

// Get conversation summary for display
export const getConversationSummary = (conversation: ConversationState): {
  userName?: string;
  issueTitle?: string;
  category?: string;
  progress: number;
  isComplete: boolean;
} => {
  const { collectedData, currentStep } = conversation;
  
  return {
    userName: collectedData.userName,
    issueTitle: collectedData.issueTitle,
    category: collectedData.confirmedCategory ? getCategoryDisplayName(collectedData.confirmedCategory as TicketCategoryType) : undefined,
    progress: getProgressPercentage(currentStep),
    isComplete: conversation.isComplete,
  };
};

// Helper function to get progress percentage
const getProgressPercentage = (step: ConversationStepType): number => {
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
