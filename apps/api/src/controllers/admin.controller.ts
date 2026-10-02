import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository.js';
import { NotFoundError } from '@ai-gurukul/types';

export class AdminController {
  private readonly userRepo: UserRepository;

  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  public listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.userRepo.paginate({}, { page, limit });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map((u) => u.toDTO()),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const user = await this.userRepo.updateById(userId, { $set: { role } });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({
        success: true,
        data: { user: user.toDTO() },
      });
    } catch (err) {
      next(err);
    }
  };
}
