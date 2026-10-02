import { Schema, model, Document, Model } from 'mongoose';
import {
  UserDTO,
  UserRole,
  WisdomPersona,
  SupportedLanguage,
  OAuthProviderInfo,
} from '@ai-gurukul/types';

export interface IUserDocument extends Document {
  email: string;
  passwordHash?: string | null;
  displayName: string;
  role: UserRole;
  oauthProviders: OAuthProviderInfo[];
  preferences: {
    defaultPersona: WisdomPersona;
    language: SupportedLanguage;
    notificationsEnabled: boolean;
  };
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): UserDTO;
}

const OAuthProviderSchema = new Schema<OAuthProviderInfo>(
  {
    provider: {
      type: String,
      enum: ['google'],
      required: true,
    },
    providerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { _id: false }
);

const UserPreferencesSchema = new Schema(
  {
    defaultPersona: {
      type: String,
      enum: ['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali'],
      default: 'krishna',
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'sa', 'hi', 'ta'],
      default: 'en',
      required: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { _id: false }
);

export const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ['learner', 'scholar', 'admin'],
      default: 'learner',
      required: true,
      index: true,
    },
    oauthProviders: {
      type: [OAuthProviderSchema],
      default: [],
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({
        defaultPersona: 'krishna',
        language: 'en',
        notificationsEnabled: true,
      }),
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

// Compound sparse index for oauth providers
UserSchema.index(
  { 'oauthProviders.provider': 1, 'oauthProviders.providerId': 1 },
  { sparse: true }
);

// Method to format document cleanly as UserDTO
UserSchema.methods.toDTO = function (): UserDTO {
  return {
    id: this._id ? this._id.toString() : '',
    email: this.email,
    displayName: this.displayName,
    role: this.role,
    preferences: {
      defaultPersona: this.preferences?.defaultPersona || 'krishna',
      language: this.preferences?.language || 'en',
      notificationsEnabled: this.preferences?.notificationsEnabled ?? true,
    },
    isEmailVerified: this.isEmailVerified,
    oauthProviders: this.oauthProviders || [],
    createdAt: this.createdAt ? this.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const UserModel: Model<IUserDocument> = model<IUserDocument>('User', UserSchema);
