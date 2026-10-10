import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quiz.service.js';
import {
  CreateQuizDTO,
  GenerateDynamicQuizInput,
  SubmitQuizAttemptInput,
  QuizFilterParams,
} from '@ai-gurukul/types';

export class QuizController {
  private quizService: QuizService;

  constructor(quizService: QuizService) {
    this.quizService = quizService;
  }

  public getQuizzes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filterParams: QuizFilterParams = {
        domain: req.query.domain as QuizFilterParams['domain'],
        difficulty: req.query.difficulty as QuizFilterParams['difficulty'],
        tag: req.query.tag as string,
        search: req.query.search as string,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
      };

      const result = await this.quizService.getQuizzes(filterParams);

      res.status(200).json({
        success: true,
        data: result.quizzes,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const quiz = await this.quizService.getQuizById(id);

      res.status(200).json({
        success: true,
        data: quiz,
      });
    } catch (err) {
      next(err);
    }
  };

  public createQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateQuizDTO;
      const created = await this.quizService.createQuiz(body);

      res.status(201).json({
        success: true,
        data: created,
        message: 'Quiz created successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  public generateDynamicQuiz = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = req.body as GenerateDynamicQuizInput;
      const generated = await this.quizService.generateDynamicQuiz(body);

      res.status(201).json({
        success: true,
        data: generated,
        message: 'Dynamic Vedic quiz generated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  public submitAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as SubmitQuizAttemptInput;
      const userId = req.user?.sub;

      const attemptResult = await this.quizService.submitAttempt(body, userId);

      res.status(200).json({
        success: true,
        data: attemptResult,
        message: attemptResult.passed
          ? 'Congratulations! You passed the Vedic discernment assessment.'
          : 'Assessment complete. Review explanations to deepen your Vedic understanding.',
      });
    } catch (err) {
      next(err);
    }
  };

  public getUserAttempts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const attempts = await this.quizService.getUserAttempts(userId, limit);

      res.status(200).json({
        success: true,
        data: attempts,
      });
    } catch (err) {
      next(err);
    }
  };

  public getAttempt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const attempt = await this.quizService.getAttemptById(id);

      res.status(200).json({
        success: true,
        data: attempt,
      });
    } catch (err) {
      next(err);
    }
  };

  public getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const stats = await this.quizService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  };
}
