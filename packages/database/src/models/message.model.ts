import { Schema, model, Document, Model, Types } from 'mongoose';
import {
  MessageDTO,
  MessageCitation,
  TokenUsage,
  MessageFeedback,
  WisdomDomain,
} from '@ai-gurukul/types';

export interface IMessageDocument extends Document {
  conversationId: Types.ObjectId;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations: MessageCitation[];
  tokenUsage?: TokenUsage;
  feedback?: MessageFeedback;
  createdAt: Date;
  toDTO(): MessageDTO;
}

const CitationSchema = new Schema<MessageCitation>(
  {
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: 'WisdomVerse',
    },
    canonicalReference: {
      type: String,
      required: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    chapter: {
      type: Number,
    },
    verse: {
      type: Number,
    },
    relevanceScore: {
      type: Number,
      default: 1.0,
    },
  },
  { _id: false }
);

const TokenUsageSchema = new Schema<TokenUsage>(
  {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  { _id: false }
);

const FeedbackSchema = new Schema<MessageFeedback>(
  {
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { _id: false }
);

export const MessageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: {
      type: [CitationSchema],
      default: [],
    },
    tokenUsage: {
      type: TokenUsageSchema,
    },
    feedback: {
      type: FeedbackSchema,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strict: 'throw',
  }
);

// Chronological message index for swift conversation retrieval
MessageSchema.index({ conversationId: 1, createdAt: 1 });

MessageSchema.methods.toDTO = function (): MessageDTO {
  return {
    id: this._id ? this._id.toString() : '',
    conversationId: this.conversationId ? this.conversationId.toString() : '',
    sender: this.sender,
    content: this.content,
    citations: this.citations && this.citations.length > 0 ? this.citations : undefined,
    tokenUsage: this.tokenUsage || undefined,
    feedback: this.feedback || undefined,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
  };
};

export const MessageModel: Model<IMessageDocument> = model<IMessageDocument>(
  'Message',
  MessageSchema
);
