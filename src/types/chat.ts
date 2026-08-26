import type { EmotionTag } from './boyfriend';

export type MessageType = 'text' | 'voice' | 'image' | 'emoji' | 'system';
export type MessageSender = 'user' | 'boyfriend' | 'system';
export type TypingStatus = 'idle' | 'typing' | 'paused' | 'sending';

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: MessageSender;
  type: MessageType;
  content: string;
  voiceUrl?: string;
  imageUrl?: string;
  emotion?: EmotionTag;
  timestamp: number;
  isRead: boolean;
  source?: 'deepseek' | 'fallback' | 'seed';
}

export interface ChatSession {
  id: string;
  boyfriendId: string;
  boyfriendName: string;
  boyfriendAvatar: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface ChatContext {
  boyfriendId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userMood?: 'happy' | 'sad' | 'angry' | 'tired' | 'neutral';
  recentTopics: string[];
  messageCount: number;
  sessionDuration: number;
}
