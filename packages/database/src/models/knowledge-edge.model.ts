import { Schema, model, Document, Model } from 'mongoose';
import { KnowledgeEdgeDTO, GraphRelationshipType } from '@ai-gurukul/types';

export interface IKnowledgeEdgeDocument extends Document {
  sourceSlug: string;
  targetSlug: string;
  relationship: GraphRelationshipType;
  description?: string;
  sourceReference?: string;
  weight: number;
  toDTO(): KnowledgeEdgeDTO;
}

export const KnowledgeEdgeSchema = new Schema<IKnowledgeEdgeDocument>(
  {
    sourceSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    targetSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    relationship: {
      type: String,
      enum: [
        'expounds',
        'authored_by',
        'affiliated_with',
        'critiques',
        'influences',
        'part_of',
        'related_to',
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sourceReference: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

KnowledgeEdgeSchema.index({ sourceSlug: 1, targetSlug: 1, relationship: 1 }, { unique: true });

KnowledgeEdgeSchema.methods.toDTO = function (): KnowledgeEdgeDTO {
  return {
    id: this._id ? this._id.toString() : '',
    sourceSlug: this.sourceSlug,
    targetSlug: this.targetSlug,
    relationship: this.relationship,
    description: this.description || undefined,
    sourceReference: this.sourceReference || undefined,
    weight: this.weight,
  };
};

export const KnowledgeEdgeModel: Model<IKnowledgeEdgeDocument> = model<IKnowledgeEdgeDocument>(
  'KnowledgeEdge',
  KnowledgeEdgeSchema
);
