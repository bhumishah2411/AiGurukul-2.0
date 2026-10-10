import {
  BaseRepository,
  IQuizDocument,
  QuizModel,
  CANONICAL_SEED_QUIZZES,
} from '@ai-gurukul/database';
import { CreateQuizDTO, QuizFilterParams } from '@ai-gurukul/types';
import { FilterQuery } from 'mongoose';

export class QuizRepository extends BaseRepository<IQuizDocument> {
  constructor() {
    super(QuizModel);
  }

  public async ensureSeeded(): Promise<number> {
    const existingCount = await this.model.countDocuments().exec();
    if (existingCount > 0) {
      return 0;
    }

    const docs = await this.model.insertMany(CANONICAL_SEED_QUIZZES);
    return docs.length;
  }

  public async findFiltered(
    params: QuizFilterParams
  ): Promise<{ quizzes: IQuizDocument[]; total: number }> {
    const filter: FilterQuery<IQuizDocument> = { isActive: true };

    if (params.domain) {
      filter.domain = params.domain;
    }

    if (params.difficulty) {
      filter.difficulty = params.difficulty;
    }

    if (params.tag) {
      filter.tags = { $in: [params.tag.toLowerCase()] };
    }

    if (params.search && params.search.trim()) {
      const regex = new RegExp(params.search.trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { quizzes, total };
  }

  public async createQuiz(data: CreateQuizDTO): Promise<IQuizDocument> {
    const quiz = new this.model({
      title: data.title,
      description: data.description,
      domain: data.domain,
      difficulty: data.difficulty,
      questions: data.questions,
      tags: data.tags || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDynamic: data.isDynamic || false,
    });
    return quiz.save();
  }
}
