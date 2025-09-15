// AI Chat Module - Exports for chat functionality, OpenAI integration, and messaging
export { OpenAIService } from './services/openai';

// Re-export chat components
export { default as ChatInput } from './components/chat-input';
export { default as ChatMessage } from './components/chat-message';
export { default as ChatPage } from './components/chat';

// Types
export type {
  ChatSession,
  ChatMessage as ChatMessageType,
  InsertChatSession,
  InsertChatMessage
} from '@shared/schema';