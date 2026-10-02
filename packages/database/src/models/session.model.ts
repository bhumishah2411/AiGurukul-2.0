import { Schema, model, Document, Model, Types } from 'mongoose';
import { SessionDTO } from '@ai-gurukul/types';

export interface ISessionDocument extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent: string;
  ipAddress: string;
  isValid: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): SessionDTO;
}

export const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

// TTL index to automatically purge expired sessions from MongoDB
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SessionSchema.methods.toDTO = function (): SessionDTO {
  return {
    id: this._id ? this._id.toString() : '',
    userId: this.userId ? this.userId.toString() : '',
    isValid: this.isValid,
    userAgent: this.userAgent,
    ipAddress: this.ipAddress,
    expiresAt: this.expiresAt ? this.expiresAt.toISOString() : new Date().toISOString(),
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const SessionModel: Model<ISessionDocument> = model<ISessionDocument>(
  'Session',
  SessionSchema
);
