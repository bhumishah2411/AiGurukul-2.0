import { Schema, model, Document, Model, Types } from 'mongoose';
import {
  AyurvedaProfileDTO,
  PrakritiScore,
  DoshaType,
  DoshaConstitutionType,
  AyurvedaRecommendation,
  VikritiLogEntry,
} from '@ai-gurukul/types';

export interface IAyurvedaProfileDocument extends Document {
  userId: Types.ObjectId;
  prakriti: PrakritiScore;
  currentImbalances: DoshaType[];
  recommendations: AyurvedaRecommendation[];
  vikritiLogs: Array<{
    _id?: Types.ObjectId;
    date: Date;
    symptoms: string[];
    elevatedDoshas: DoshaType[];
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): AyurvedaProfileDTO;
}

const PrakritiScoreSchema = new Schema<PrakritiScore>(
  {
    vata: { type: Number, required: true, min: 0, max: 100 },
    pitta: { type: Number, required: true, min: 0, max: 100 },
    kapha: { type: Number, required: true, min: 0, max: 100 },
    dominantDosha: {
      type: String,
      enum: [
        'vata',
        'pitta',
        'kapha',
        'vata-pitta',
        'pitta-kapha',
        'vata-kapha',
        'tridoshic',
      ] as DoshaConstitutionType[],
      required: true,
    },
    secondaryDosha: {
      type: String,
      enum: ['vata', 'pitta', 'kapha'] as DoshaType[],
    },
  },
  { _id: false }
);

const AyurvedaRecommendationSchema = new Schema<AyurvedaRecommendation>(
  {
    id: { type: String, required: true },
    category: {
      type: String,
      enum: ['diet', 'routine', 'herbs', 'seasonal', 'lifestyle'],
      required: true,
    },
    title: { type: String, required: true },
    guidance: { type: String, required: true },
    classicalReference: { type: String },
    benefits: [{ type: String }],
  },
  { _id: false }
);

const VikritiLogSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    symptoms: [{ type: String, required: true }],
    elevatedDoshas: [
      {
        type: String,
        enum: ['vata', 'pitta', 'kapha'],
        required: true,
      },
    ],
    notes: { type: String, maxlength: 500 },
  },
  { _id: true }
);

export const AyurvedaProfileSchema = new Schema<IAyurvedaProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    prakriti: {
      type: PrakritiScoreSchema,
      required: true,
    },
    currentImbalances: [
      {
        type: String,
        enum: ['vata', 'pitta', 'kapha'],
        default: [],
      },
    ],
    recommendations: {
      type: [AyurvedaRecommendationSchema],
      default: [],
    },
    vikritiLogs: {
      type: [VikritiLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to format document cleanly as AyurvedaProfileDTO
AyurvedaProfileSchema.methods.toDTO = function (): AyurvedaProfileDTO {
  return {
    id: this._id ? this._id.toString() : '',
    userId: this.userId ? this.userId.toString() : '',
    prakriti: this.prakriti,
    currentImbalances: this.currentImbalances || [],
    recommendations: this.recommendations || [],
    recentVikritiLogs: (this.vikritiLogs || []).slice(-10).map((log: any) => ({
      id: log._id ? log._id.toString() : String(Date.now()),
      date: log.date ? log.date.toISOString() : new Date().toISOString(),
      symptoms: log.symptoms || [],
      elevatedDoshas: log.elevatedDoshas || [],
      notes: log.notes,
    })),
    updatedAt: this.updatedAt ? this.updatedAt.toISOString() : new Date().toISOString(),
  };
};

export const AyurvedaProfileModel: Model<IAyurvedaProfileDocument> =
  model<IAyurvedaProfileDocument>('AyurvedaProfile', AyurvedaProfileSchema);
