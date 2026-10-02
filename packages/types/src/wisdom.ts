import { WisdomPersona } from './user.js';

export type WisdomDomain =
  | 'gita'
  | 'chanakya'
  | 'ramayana'
  | 'mahabharata'
  | 'panchatantra'
  | 'ayurveda'
  | 'upanishads'
  | 'classical_texts';

export interface PersonaInfo {
  id: WisdomPersona;
  name: string;
  title: string;
  domain: string;
  color: string;
  avatarIcon: string;
  description: string;
  philosophicalCore: string;
  sampleInquiries: string[];
}

export interface MessageCitation {
  sourceId?: string;
  canonicalReference: string;
  chunkText: string;
  domain: WisdomDomain;
  chapter?: number;
  verse?: number;
  relevanceScore?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface MessageFeedback {
  rating: number; // 1 to 5
  comment?: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations?: MessageCitation[];
  tokenUsage?: TokenUsage;
  feedback?: MessageFeedback;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  userId: string;
  persona: WisdomPersona;
  title: string;
  status: 'active' | 'archived';
  contextSummary?: string;
  lastMessageAt?: string;
  messageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessagesDTO extends ConversationDTO {
  messages: MessageDTO[];
}

export interface CreateConversationRequestDTO {
  persona: WisdomPersona;
  title?: string;
  initialMessage?: string;
}

export interface SendMessageRequestDTO {
  content: string;
  stream?: boolean;
}

export interface WisdomVerseDTO {
  id: string;
  domain: WisdomDomain;
  canonicalReference: string;
  sanskrit: string;
  transliteration?: string;
  englishTranslation: string;
  commentary?: string;
  themes: string[];
  speaker?: string;
}

// SSE Stream Events
export interface StreamTokenEvent {
  token: string;
  conversationId: string;
}

export interface StreamCitationEvent {
  citation: MessageCitation;
  conversationId: string;
}

export interface StreamDoneEvent {
  conversationId: string;
  messageId: string;
  fullContent: string;
  citations: MessageCitation[];
  tokenUsage?: TokenUsage;
}

export interface StreamErrorEvent {
  code: string;
  message: string;
  conversationId?: string;
}
