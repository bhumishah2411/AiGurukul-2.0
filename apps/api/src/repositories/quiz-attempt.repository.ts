import { BaseRepository, IQuizAttemptDocument, QuizAttemptModel } from '@ai-gurukul/database';
import { Types } from 'mongoose';

export class QuizAttemptRepository extends BaseRepository<IQuizAttemptDocument> {
  constructor() {
    super(QuizAttemptModel);
  }

  public async recordAttempt(
    data: Omit<Partial<IQuizAttemptDocument>, '_id'>
  ): Promise<IQuizAttemptDocument> {
    const attempt = new this.model(data);
    return attempt.save();
  }

  public async findByUser(userId: string, limit = 20): Promise<IQuizAttemptDocument[]> {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ completedAt: -1 })
      .limit(limit)
      .exec();
  }

  public async findByQuiz(quizId: string, limit = 20): Promise<IQuizAttemptDocument[]> {
    return this.model
      .find({ quizId: new Types.ObjectId(quizId) })
      .sort({ completedAt: -1 })
      .limit(limit)
      .exec();
  }

  public async getUserStats(userId: string): Promise<{
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    highestScore: number;
  }> {
    const attempts = await this.model
      .find({ userId: new Types.ObjectId(userId) })
      .select('score totalQuestions percentage passed')
      .exec();

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        passedAttempts: 0,
        averageScore: 0,
        highestScore: 0,
      };
    }

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const totalPercentage = attempts.reduce((acc, a) => acc + a.percentage, 0);
    const averageScore = Math.round((totalPercentage / totalAttempts) * 10) / 10;
    const highestScore = Math.max(...attempts.map((a) => a.percentage));

    return {
      totalAttempts,
      passedAttempts,
      averageScore,
      highestScore,
    };
  }
}
