# AI-Powered Support System - Frontend

A modern, intelligent customer support platform built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. This system features an AI-guided chat interface for end users and a comprehensive dashboard for support technicians, with full backend integration and real-time WebSocket communication.

## Features Overview

### **AI-Powered Chat Interface** (`/chat`)
- **Guided Conversation Flow**: AI assistant walks users through 8 structured steps
- **Smart Category Detection**: Real-time categorization using backend AI service
- **Backend Integration**: Live API communication with intelligent conversation processing
- **Real-time Typing Indicators**: Shows when the AI is "thinking" and responding
- **Progress Tracking**: Visual progress bar showing conversation completion
- **Auto-Ticket Creation**: Seamless ticket generation upon conversation completion
- **Toast Notifications**: Success/error feedback for all actions
- **Keyboard Shortcuts**: Quick actions and accessibility features
- **Connection Status**: Real-time WebSocket connection monitoring
- **Share Functionality**: Easy sharing of conversation summaries
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### **Support Dashboard** (`/support`)
- **Advanced Filtering**: Filter by status, priority, category, and date ranges
- **Multiple View Modes**: Grid and list views for optimal workflow
- **Real-time Statistics**: Live updates of ticket metrics from database
- **WebSocket Integration**: Real-time ticket updates via Socket.IO
- **Search & Sort**: Powerful search with multiple sorting options
- **Command Palette**: Quick access to all actions (Ctrl+K)
- **Keyboard Navigation**: Full keyboard accessibility
- **Live Event Feed**: Real-time ticket creation and update notifications
- **Connection Monitoring**: WebSocket connection status with auto-reconnect
- **Database Integration**: All tickets stored and managed in real database
- **Bulk Operations**: Handle multiple tickets efficiently
- **Status Management**: Easy ticket status and priority updates with instant sync

### **Modern UI/UX & Polish**
- **Toast Notification System**: 4 types (success, error, warning, info) with auto-dismiss
- **Loading States**: Multiple spinner variants and loading overlays
- **Keyboard Shortcuts**: Comprehensive shortcut system with help modal
- **Command Palette**: Fuzzy search with categorized commands
- **Connection Status**: Real-time network monitoring with visual indicators
- **Shadcn UI Components**: Beautiful, accessible, and consistent design system
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Dark/Light Mode Ready**: Built with CSS variables for easy theming
- **Mobile-First**: Responsive design that works on all devices
- **WCAG Compliant**: Accessible to users with disabilities

### **Real-time Features**
- **Socket.IO Integration**: Production-ready WebSocket communication
- **Live Ticket Updates**: Instant notifications for ticket creation and status changes
- **Connection Management**: Auto-reconnect with exponential backoff
- **Live Statistics**: Real-time dashboard metrics updates from backend
- **Status Indicators**: Visual feedback for WebSocket connection state
- **User Rooms**: Organized real-time communication channels
- **Event Broadcasting**: Multi-user live updates for support teams

## **Technical Architecture**

### **Frontend Stack**
- **Next.js 15** (App Router) - React framework with server-side rendering
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and developer experience
- **Tailwind CSS 4** - Latest utility-first CSS framework
- **Shadcn UI** - Modern component library
- **Socket.IO Client** - Real-time WebSocket communication
- **Zod** - Runtime type validation and API contracts
- **Lucide React** - Beautiful icon library
- **UUID** - Unique identifier generation
- **Class Variance Authority** - Component variant system

### **Project Structure**
```
support-frontend/
├── app/                    # Next.js App Router directory
│   ├── components/         # Reusable UI components
│   │   ├── chat/          # Chat-specific components
│   │   │   ├── ChatInput.tsx        # Smart input with suggestions  
│   │   │   ├── ChatMessage.tsx      # Rich message bubbles
│   │   │   ├── ConversationFlow.tsx # Main chat interface
│   │   │   ├── TypingIndicator.tsx  # Animated typing feedback
│   │   │   └── index.ts             # Component exports
│   │   ├── tickets/       # Ticket management components
│   │   │   ├── TicketCard.tsx       # Multi-variant ticket display
│   │   │   ├── TicketStats.tsx      # Statistics dashboard
│   │   │   └── index.ts             # Component exports
│   │   ├── ui/            # Shadcn UI + Custom components
│   │   │   ├── alert.tsx            # Alert component
│   │   │   ├── avatar.tsx           # Avatar component
│   │   │   ├── badge.tsx            # Badge component
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── command-palette.tsx  # Advanced command interface
│   │   │   ├── connection-status.tsx # Real-time connection indicator
│   │   │   ├── dialog.tsx           # Dialog component
│   │   │   ├── input.tsx            # Input component
│   │   │   ├── keyboard-shortcut.tsx # Shortcut system with help
│   │   │   ├── loading-spinner.tsx  # Multiple loading variants
│   │   │   ├── progress.tsx         # Progress bar component
│   │   │   ├── scroll-area.tsx      # Scroll area component
│   │   │   ├── separator.tsx        # Separator component
│   │   │   ├── skeleton.tsx         # Skeleton loading component
│   │   │   ├── textarea.tsx         # Textarea component
│   │   │   ├── toast.tsx            # Toast notification system
│   │   │   └── index.ts             # Component exports
│   │   └── index.ts       # Main component exports
│   ├── hooks/             # Custom React hooks
│   │   ├── useChat.ts              # Chat state management with backend API
│   │   ├── useLocalStorage.ts      # Local storage utilities
│   │   ├── useRealTimeSimulation.ts # Real-time event simulation
│   │   ├── useTickets.ts           # Ticket management with database integration
│   │   └── useWebSocket.ts         # Socket.IO WebSocket integration
│   ├── lib/               # Core business logic
│   │   ├── api.ts                  # API client and error handling
│   │   ├── assistantLogic.ts       # AI conversation logic
│   │   └── utils.ts                # Utility functions
│   ├── types/             # TypeScript definitions
│   │   ├── api.ts                  # API contracts
│   │   ├── chat.ts                 # Chat and conversation types
│   │   └── ticket.ts               # Ticket management types
│   ├── chat/              # Chat interface page
│   │   └── page.tsx                # AI-powered chat interface
│   ├── support/           # Support dashboard page
│   │   └── page.tsx                # Support ticket management dashboard
│   ├── favicon.ico        # Site favicon
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Landing page
├── public/                # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── window.svg
├── .cursorrules           # Cursor IDE configuration
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .gitignore            # Git ignore rules
├── components.json        # Shadcn UI configuration
├── ENV_SETUP.md          # Environment setup documentation
├── eslint.config.mjs     # ESLint module configuration
├── next-env.d.ts         # Next.js TypeScript declarations
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── README.md             # Project documentation
├── setup.sh              # Automated setup script
└── tsconfig.json         # TypeScript configuration
```

## **Getting Started**

### Prerequisites
- **Node.js 18+** 
- **npm** or **yarn**
- **Backend API** - The support-backend must be running

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd support-frontend
   ```

2. **Run automated setup**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start backend first**
   ```bash
   # In the support-backend directory
   cd ../support-backend
   npm run dev  # Backend runs on port 3001
   ```

4. **Start frontend development server**
   ```bash
   # Back in support-frontend directory
   npm run dev  # Frontend runs on port 3000
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

The application will be available with:
- **Landing Page**: `http://localhost:3000/`
- **Chat Interface**: `http://localhost:3000/chat`
- **Support Dashboard**: `http://localhost:3000/support`

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## **User Roles & Interfaces**

### **End Users** → `/chat`
**Purpose**: Simple, guided support ticket creation
- AI-guided conversation with step-by-step assistance
- No technical knowledge required
- Mobile-optimized for on-the-go support requests
- Automatic ticket generation upon completion
- Share conversation summaries easily

### **Tech Support Staff** → `/support`
**Purpose**: Advanced ticket management and monitoring
- Comprehensive dashboard with real-time statistics
- Advanced filtering and search capabilities
- Keyboard shortcuts for power users (Ctrl+K for command palette)
- Real-time event monitoring and connection status
- Multiple view modes for different workflows

### **Shared Features**
- Professional, consistent UI/UX across all interfaces
- Full keyboard accessibility and screen reader support
- Toast notifications for user feedback
- Responsive design for all device types
- Real-time connection monitoring

## **User Flows**

### **End User Journey** (`/chat`)
1. **Landing Page** → Navigate to "Start Support Chat"
2. **AI Greeting** → AI welcomes user and explains the process
3. **Issue Description** → User describes their problem in natural language
4. **Category Detection** → AI suggests appropriate category
5. **Detail Collection** → AI asks follow-up questions based on category
6. **Contact Information** → User provides name and email
7. **Summary & Confirmation** → Review all collected information
8. **Ticket Creation** → Automatic ticket generation with unique ID
9. **Success & Sharing** → Share conversation or start a new one

### **Support Tech Journey** (`/support`)
1. **Dashboard Overview** → See ticket statistics and real-time metrics
2. **Filter & Search** → Use advanced filters or command palette (Ctrl+K)
3. **Ticket Management** → Update status, priority, and assignments
4. **Real-time Monitoring** → Watch live event feed and connection status
5. **Keyboard Navigation** → Use shortcuts for efficient workflow
6. **Bulk Operations** → Handle multiple tickets efficiently

## ⌨️ **Keyboard Shortcuts & Accessibility**

### **Global Shortcuts**
- `Ctrl/Cmd + K` - Open command palette
- `?` - Show keyboard shortcuts help
- `Escape` - Close modals/dialogs
- `Tab` / `Shift + Tab` - Navigate between elements

### **Chat Interface**
- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Ctrl/Cmd + R` - Reset conversation
- `Ctrl/Cmd + S` - Share conversation

### **Support Dashboard**
- `Ctrl/Cmd + F` - Focus search
- `1-4` - Switch between status tabs
- `G` then `G` - Go to grid view
- `G` then `L` - Go to list view
- `R` - Refresh data

### **Command Palette Actions**
- Quick navigation between pages
- Filter tickets by status/priority
- Switch view modes
- Create new tickets
- Access help documentation

## **Advanced Components**

### **Toast Notification System**
```typescript
// Four types with customizable options
toast.success('Ticket created successfully!');
toast.error('Failed to update ticket');
toast.warning('Connection unstable');
toast.info('New update available');
```

Features:
- Auto-dismiss with configurable timing
- Action buttons for interactive notifications
- Progress bars for long-running operations
- Stack management for multiple toasts
- Accessible with screen reader support

### **Loading System**
Multiple loading states for different contexts:
- **Spinner variants**: Default, dots, pulse, bounce
- **Size options**: Small, medium, large
- **Page overlays**: Full-page loading states
- **Component loading**: Skeleton states for components

### **Real-time & WebSocket Features**
Comprehensive real-time communication system:
- **Socket.IO Integration**: Production WebSocket connection to backend
- **Live Event Simulation**: Development-friendly event generation for testing
- **Connection Management**: Auto-reconnect with exponential backoff
- **Multi-user Support**: Real-time updates across all connected clients
- **Event Broadcasting**: Instant notifications for ticket updates

### **Connection Status Monitoring**
Real-time connection indicators:
- Visual status indicators (Connected, Connecting, Disconnected)
- Activity timestamps and connection duration
- Automatic reconnection attempts
- Network quality indicators

## **AI Assistant Logic**

### **8-Step Conversation Flow** (Backend-Processed)
1. **Greeting** - Welcome message and process explanation
2. **Initial Issue** - User describes their problem
3. **Category Suggestion** - Backend AI service suggests category based on advanced pattern matching
4. **Category Confirmation** - User confirms or corrects category
5. **Additional Details** - Category-specific follow-up questions
6. **Contact Collection** - Name and email gathering with smart extraction
7. **Final Confirmation** - Summary of all collected data
8. **Ticket Creation** - Automatic database ticket creation with real ticket ID

### **Smart Features**
- **Backend AI Processing**: Server-side intelligent conversation management
- **Advanced Pattern Matching**: Sophisticated keyword analysis across multiple categories
- **Context Awareness**: Questions adapt based on user responses and category
- **Input Validation**: Dual-layer validation (frontend Zod + backend sanitization)
- **Error Recovery**: Graceful handling of invalid inputs with helpful messages
- **Progress Tracking**: Real-time conversation completion status (0-100%)
- **Conversation Persistence**: State management with backend synchronization
- **Auto-Ticket Creation**: Seamless ticket generation upon conversation completion

### **Category Detection** (Backend AI Service)
Advanced categorization using sophisticated pattern matching:
- **Technical Issues**: Advanced regex patterns for bugs, errors, performance issues
- **Account Problems**: Login, password, access, and profile-related issues
- **Billing Questions**: Payment, subscription, refund, and billing inquiries
- **Feature Requests**: Enhancement requests and suggestions
- **Bug Reports**: Specific bug reporting with technical detail collection
- **General Support**: Intelligent fallback with context-aware follow-up

### **Natural Language Processing**
- **Smart Name Extraction**: Handles sentences like "Hi, my name is John Smith"
- **Enhanced Yes/No Detection**: Recognizes variations like "yes let's do it", "go ahead"
- **Input Sanitization**: Server-side XSS prevention and data cleansing
- **Email Validation**: RFC-compliant email validation with helpful error messages

## **Design System**

### **Color Palette**
- **Primary**: Blue gradient (blue-600 to purple-600)
- **Success**: Green (green-600) - for successful actions
- **Warning**: Yellow (yellow-600) - for caution states
- **Error**: Red (red-600) - for error states
- **Info**: Blue (blue-600) - for informational messages
- **Neutral**: Gray scale (gray-50 to gray-900)

### **Typography**
- **Headings**: Inter font, various weights (400-700)
- **Body**: Inter font, regular weight (400)
- **Code**: JetBrains Mono, monospace
- **UI Elements**: Inter font with appropriate sizing

### **Component Design Principles**
- **Consistent spacing** using Tailwind's 4px spacing scale
- **Rounded corners** with 4px, 8px, and 12px radius system
- **Shadow system** for depth and hierarchy (sm, md, lg, xl)
- **Animation** using CSS transitions for micro-interactions
- **Focus states** with visible indicators for accessibility

## **Production Readiness**

### **Build Metrics**
- **Chat Page**: ~162KB optimized bundle
- **Support Dashboard**: ~155KB optimized bundle
- **Landing Page**: ~45KB optimized bundle
- **All pages**: Pre-rendered as static content for optimal performance

### **Performance Optimizations**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## **Full Stack Integration**

This frontend application is designed to work seamlessly with the **support-backend** repository:

### **Real Backend Communication**
- **Live API Integration**: All chat processing and ticket management through real REST API
- **WebSocket Connection**: Real-time updates via Socket.IO for instant notifications
- **Database Persistence**: All tickets and conversations stored in SQLite/PostgreSQL database
- **AI Processing**: Server-side conversation logic with advanced pattern matching

### **Real-time Features**
- **Live Ticket Updates**: Instant notifications when tickets are created or updated
- **Connection Monitoring**: Real-time WebSocket connection status with auto-reconnect
- **Multi-user Support**: Support teams can see live updates across all connected clients
- **Event Broadcasting**: System-wide notifications for important events

### **Production Architecture**
- **Microservices Ready**: Frontend and backend can be deployed independently
- **Scalable Design**: WebSocket connections and database operations optimized for high load
- **Environment Agnostic**: Works with development, staging, and production backends
- **Security Focused**: CORS configuration, input validation, and secure communication

### **Monitoring & Analytics**
- **Real-time Metrics**: Live dashboard statistics from database
- **Connection Health**: WebSocket connection monitoring and diagnostics
- **Performance Tracking**: API response times and error rates
- **User Activity**: Real-time user presence and activity tracking

---

**Related Repositories:**
- [Backend Repository](https://github.com/heyimhere/support-backend) - Node.js API with Socket.IO
- [Environment Setup Guide](https://github.com/heyimhere/support-backend/blob/main/ENV_SETUP.md) - Complete setup instructions

**Need Help?**
1. Ensure the backend is running on `http://localhost:3001`
2. Check environment variables in `.env.local`
3. Verify WebSocket connection in browser dev tools
4. Review the backend logs for API communication

**This is a complete, production-ready customer support system with real backend integration, advanced AI conversation processing, and professional-grade real-time features.**

