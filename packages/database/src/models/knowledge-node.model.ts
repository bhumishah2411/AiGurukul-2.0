import { Schema, model, Document, Model } from 'mongoose';
import { KnowledgeNodeDTO, GraphEntityType } from '@ai-gurukul/types';

export interface IKnowledgeNodeDocument extends Document {
  slug: string;
  name: string;
  sanskritName?: string;
  entityType: GraphEntityType;
  summary: string;
  description: string;
  era?: string;
  primarySources: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): KnowledgeNodeDTO;
}

export const KnowledgeNodeSchema = new Schema<IKnowledgeNodeDocument>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sanskritName: {
      type: String,
      trim: true,
    },
    entityType: {
      type: String,
      enum: ['concept', 'text', 'tradition', 'author', 'practice'],
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    era: {
      type: String,
      trim: true,
    },
    primarySources: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

KnowledgeNodeSchema.index({
  name: 'text',
  sanskritName: 'text',
  summary: 'text',
  description: 'text',
  tags: 'text',
});

KnowledgeNodeSchema.methods.toDTO = function (): KnowledgeNodeDTO {
  return {
    id: this._id ? this._id.toString() : '',
    slug: this.slug,
    name: this.name,
    sanskritName: this.sanskritName || undefined,
    entityType: this.entityType,
    summary: this.summary,
    description: this.description,
    era: this.era || undefined,
    primarySources: this.primarySources || [],
    tags: this.tags || [],
    metadata: this.metadata || {},
    createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
  };
};

export const KnowledgeNodeModel: Model<IKnowledgeNodeDocument> = model<IKnowledgeNodeDocument>(
  'KnowledgeNode',
  KnowledgeNodeSchema
);
