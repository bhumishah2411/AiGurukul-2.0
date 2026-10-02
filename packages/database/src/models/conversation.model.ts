import { Schema, model, Document, Model, Types } from 'mongoose';
import { ConversationDTO, WisdomPersona } from '@ai-gurukul/types';

export interface IConversationDocument extends Document {
  userId: Types.ObjectId;
  persona: WisdomPersona;
  title: string;
  status: 'active' | 'archived';
  contextSummary?: string;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): ConversationDTO;
}

export const ConversationSchema = new Schema<IConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    persona: {
      type: String,
      enum: ['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      default: 'Sacred Inquiry',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
    contextSummary: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

// Compound index for user conversations ordered by latest activity
ConversationSchema.index({ userId: 1, updatedAt: -1 });

ConversationSchema.methods.toDTO = function (): ConversationDTO {
  return {
    id: this._id ? this._id.toString() : '',
    userId: this.userId ? this.userId.toString() : '',
    persona: this.persona,
    title: this.title,
    status: this.status,
    contextSummary: this.contextSummary || undefined,
    lastMessageAt: this.lastMessageAt ? this.lastMessageAt.toISOString() : undefined,
    messageCount: this.messageCount,
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>(
  'Conversation',
  ConversationSchema
);
