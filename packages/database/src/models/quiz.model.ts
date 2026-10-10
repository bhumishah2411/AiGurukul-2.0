import { Schema, model, Document, Model } from 'mongoose';
import {
  QuizDTO,
  QuizClientDTO,
  QuizSummaryDTO,
  QuizDomain,
  QuizDifficulty,
  QuizQuestionDTO,
} from '@ai-gurukul/types';

export interface IQuizQuestionSubdocument {
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef?: string;
}

export interface IQuizDocument extends Document {
  title: string;
  description?: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  questions: IQuizQuestionSubdocument[];
  tags: string[];
  isActive: boolean;
  isDynamic: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): QuizDTO;
  toClientDTO(): QuizClientDTO;
  toSummaryDTO(): QuizSummaryDTO;
}

const QuizQuestionSchema = new Schema<IQuizQuestionSubdocument>(
  {
    questionText: { type: String, required: true, trim: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true, trim: true },
    sourceRef: { type: String, trim: true },
  },
  { _id: false }
);

export const QuizSchema = new Schema<IQuizDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    domain: {
      type: String,
      enum: [
        'gita',
        'chanakya',
        'upanishads',
        'ayurveda',
        'mahabharata',
        'ramayana',
        'panchatantra',
        'general',
      ],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    questions: {
      type: [QuizQuestionSchema],
      required: true,
      validate: [(val: unknown[]) => val.length > 0, 'Quiz must have at least one question'],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDynamic: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'quizzes',
  }
);

QuizSchema.index({ domain: 1, difficulty: 1 });
QuizSchema.index({ isActive: 1, domain: 1 });

QuizSchema.methods.toDTO = function (this: IQuizDocument): QuizDTO {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    domain: this.domain,
    difficulty: this.difficulty,
    questions: this.questions.map((q, idx) => ({
      questionIndex: idx,
      questionText: q.questionText,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      sourceRef: q.sourceRef,
    })),
    tags: [...this.tags],
    isActive: this.isActive,
    isDynamic: this.isDynamic,
    createdAt: this.createdAt?.toISOString(),
    updatedAt: this.updatedAt?.toISOString(),
  };
};

QuizSchema.methods.toClientDTO = function (this: IQuizDocument): QuizClientDTO {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    domain: this.domain,
    difficulty: this.difficulty,
    totalQuestions: this.questions.length,
    questions: this.questions.map((q, idx) => ({
      questionIndex: idx,
      questionText: q.questionText,
      options: [...q.options],
      sourceRef: q.sourceRef,
    })),
    tags: [...this.tags],
    isDynamic: this.isDynamic,
    createdAt: this.createdAt?.toISOString(),
  };
};

QuizSchema.methods.toSummaryDTO = function (this: IQuizDocument): QuizSummaryDTO {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    domain: this.domain,
    difficulty: this.difficulty,
    questionCount: this.questions.length,
    tags: [...this.tags],
    isActive: this.isActive,
    isDynamic: this.isDynamic,
    createdAt: this.createdAt?.toISOString(),
  };
};

export const QuizModel: Model<IQuizDocument> = model<IQuizDocument>('Quiz', QuizSchema);
