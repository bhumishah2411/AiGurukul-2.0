import { Schema, model, Document, Model } from 'mongoose';
import { WisdomVerseDTO, WisdomDomain } from '@ai-gurukul/types';

export interface IWisdomVerseDocument extends Document {
  domain: WisdomDomain;
  canonicalReference: string;
  sanskrit: string;
  transliteration?: string;
  englishTranslation: string;
  commentary?: string;
  themes: string[];
  speaker?: string;
  toDTO(): WisdomVerseDTO;
}

export const WisdomVerseSchema = new Schema<IWisdomVerseDocument>(
  {
    domain: {
      type: String,
      enum: [
        'gita',
        'chanakya',
        'ramayana',
        'mahabharata',
        'panchatantra',
        'ayurveda',
        'upanishads',
        'classical_texts',
      ],
      required: true,
      index: true,
    },
    canonicalReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sanskrit: {
      type: String,
      required: true,
      trim: true,
    },
    transliteration: {
      type: String,
      trim: true,
    },
    englishTranslation: {
      type: String,
      required: true,
      trim: true,
    },
    commentary: {
      type: String,
      trim: true,
    },
    themes: {
      type: [String],
      default: [],
      index: true,
    },
    speaker: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

WisdomVerseSchema.methods.toDTO = function (): WisdomVerseDTO {
  return {
    id: this._id ? this._id.toString() : '',
    domain: this.domain,
    canonicalReference: this.canonicalReference,
    sanskrit: this.sanskrit,
    transliteration: this.transliteration || undefined,
    englishTranslation: this.englishTranslation,
    commentary: this.commentary || undefined,
    themes: this.themes || [],
    speaker: this.speaker || undefined,
  };
};

export const WisdomVerseModel: Model<IWisdomVerseDocument> = model<IWisdomVerseDocument>(
  'WisdomVerse',
  WisdomVerseSchema
);
