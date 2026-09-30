import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service.js';

export class HealthController {
  private healthService: HealthService;

  constructor(healthService: HealthService) {
    this.healthService = healthService;
  }

  public getLive = (_req: Request, res: Response): void => {
    const status = this.healthService.getLiveness();
    res.status(200).json({
      success: true,
      data: status,
    });
  };

  public getReady = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isReady, details } = await this.healthService.getReadiness();
      res.status(isReady ? 200 : 503).json({
        success: isReady,
        data: details,
      });
    } catch (err) {
      next(err);
    }
  };
}
