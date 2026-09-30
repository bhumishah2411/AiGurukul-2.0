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

export interface WisdomContentDTO {
  id: string;
  domain: WisdomDomain;
  canonicalReference: string;
  originalText: string;
  transliteration?: string;
  translations: Array<{
    language: string;
    text: string;
    author?: string;
  }>;
  commentaries?: Array<{
    commentator: string;
    text: string;
  }>;
  themes: string[];
  metadata?: Record<string, unknown>;
}

export interface ConversationDTO {
  id: string;
  userId: string;
  persona: WisdomPersona;
  title: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface MessageCitation {
  sourceId: string;
  canonicalReference: string;
  chunkText: string;
  relevanceScore: number;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations?: MessageCitation[];
  createdAt: string;
}
