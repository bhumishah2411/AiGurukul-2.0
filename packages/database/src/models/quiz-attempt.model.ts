import { Schema, model, Document, Model, Types } from 'mongoose';
import {
  QuizAttemptDTO,
  QuizAttemptAnswerResult,
  QuizDomain,
  QuizDifficulty,
} from '@ai-gurukul/types';

export interface IQuizAttemptAnswerSubdocument {
  questionIndex: number;
  questionText: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  sourceRef?: string;
}

export interface IQuizAttemptDocument extends Document {
  userId?: Types.ObjectId;
  quizId: Types.ObjectId;
  quizTitle: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: IQuizAttemptAnswerSubdocument[];
  weakAreas: string[];
  timeSpentSeconds?: number;
  completedAt: Date;
  toDTO(): QuizAttemptDTO;
}

const QuizAttemptAnswerSchema = new Schema<IQuizAttemptAnswerSubdocument>(
  {
    questionIndex: { type: Number, required: true },
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    selectedIndex: { type: Number, required: true },
    correctIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String, required: true },
    sourceRef: { type: String },
  },
  { _id: false }
);

export const QuizAttemptSchema = new Schema<IQuizAttemptDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    quizTitle: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    answers: {
      type: [QuizAttemptAnswerSchema],
      required: true,
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: 'quiz_attempts',
  }
);

QuizAttemptSchema.index({ userId: 1, quizId: 1, completedAt: -1 });
QuizAttemptSchema.index({ quizId: 1, completedAt: -1 });

QuizAttemptSchema.methods.toDTO = function (this: IQuizAttemptDocument): QuizAttemptDTO {
  return {
    id: this._id.toString(),
    userId: this.userId ? this.userId.toString() : undefined,
    quizId: this.quizId.toString(),
    quizTitle: this.quizTitle,
    domain: this.domain as QuizDomain,
    difficulty: this.difficulty as QuizDifficulty,
    score: this.score,
    totalQuestions: this.totalQuestions,
    percentage: this.percentage,
    passed: this.passed,
    answers: this.answers.map((a) => ({
      questionIndex: a.questionIndex,
      questionText: a.questionText,
      options: [...a.options],
      selectedIndex: a.selectedIndex,
      correctIndex: a.correctIndex,
      isCorrect: a.isCorrect,
      explanation: a.explanation,
      sourceRef: a.sourceRef,
    })),
    weakAreas: [...this.weakAreas],
    timeSpentSeconds: this.timeSpentSeconds,
    completedAt: this.completedAt.toISOString(),
  };
};

export const QuizAttemptModel: Model<IQuizAttemptDocument> = model<IQuizAttemptDocument>(
  'QuizAttempt',
  QuizAttemptSchema
);
