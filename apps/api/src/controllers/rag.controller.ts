import { Request, Response, NextFunction } from 'express';
import { RAGService } from '../services/rag.service.js';
import { RAGQueryInput } from '@ai-gurukul/validation';

export class RAGController {
  constructor(private readonly ragService: RAGService) {}

  public query = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as RAGQueryInput;
      const result = await this.ragService.query(payload);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public stats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.ragService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
