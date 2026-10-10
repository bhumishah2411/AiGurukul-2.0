import { Schema, model, Document, Model, Types } from 'mongoose';
import { DocumentChunkDTO, DocumentMetadata } from '@ai-gurukul/types';

export interface IDocumentChunkRecord extends Document {
  documentId: Types.ObjectId;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  canonicalReference?: string;
  metadata: DocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): DocumentChunkDTO;
}

export const DocumentChunkSchema = new Schema<IDocumentChunkRecord>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    text: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
      required: true,
      default: 0,
    },
    canonicalReference: {
      type: String,
      trim: true,
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

// Unique compound index so chunks for a document are ordered and distinct
DocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

// Text index for text-based keyword search fallback
DocumentChunkSchema.index(
  {
    text: 'text',
    canonicalReference: 'text',
  },
  {
    weights: {
      canonicalReference: 5,
      text: 1,
    },
    default_language: 'none',
    language_override: 'none',
    name: 'document_chunk_text_idx',
  }
);

DocumentChunkSchema.methods.toDTO = function (): DocumentChunkDTO {
  return {
    id: this._id.toString(),
    documentId: this.documentId.toString(),
    chunkIndex: this.chunkIndex,
    text: this.text,
    tokenCount: this.tokenCount,
    canonicalReference: this.canonicalReference,
    metadata: this.metadata,
    createdAt: this.createdAt.toISOString(),
  };
};

export const DocumentChunkModel: Model<IDocumentChunkRecord> = model<IDocumentChunkRecord>(
  'DocumentChunk',
  DocumentChunkSchema
);
