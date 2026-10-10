import { Schema, model, Document, Model } from 'mongoose';
import { DocumentDTO, DocumentStatus } from '@ai-gurukul/types';

export interface IDocumentRecord extends Document {
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  domain: string;
  language: string;
  author?: string;
  era?: string;
  status: DocumentStatus;
  chunkCount: number;
  tokenCount: number;
  errorMessage?: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): DocumentDTO;
}

export const DocumentSchema = new Schema<IDocumentRecord>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      default: 0,
    },
    mimeType: {
      type: String,
      required: true,
      default: 'text/plain',
    },
    storageKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      default: 'en',
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    era: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'extracting', 'chunking', 'embedding', 'indexed', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

// Compound and text indexes
DocumentSchema.index({ domain: 1, status: 1 });
DocumentSchema.index({ status: 1, createdAt: -1 });
DocumentSchema.index(
  {
    title: 'text',
    author: 'text',
    domain: 'text',
  },
  {
    weights: {
      title: 10,
      author: 5,
      domain: 3,
    },
    default_language: 'none',
    language_override: 'none',
    name: 'document_text_search_idx',
  }
);

DocumentSchema.methods.toDTO = function (): DocumentDTO {
  return {
    id: this._id.toString(),
    title: this.title,
    fileName: this.fileName,
    fileSize: this.fileSize,
    mimeType: this.mimeType,
    storageKey: this.storageKey,
    domain: this.domain,
    language: this.language,
    author: this.author,
    era: this.era,
    status: this.status,
    chunkCount: this.chunkCount,
    tokenCount: this.tokenCount,
    errorMessage: this.errorMessage,
    uploadedBy: this.uploadedBy,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const DocumentModel: Model<IDocumentRecord> = model<IDocumentRecord>(
  'Document',
  DocumentSchema
);
