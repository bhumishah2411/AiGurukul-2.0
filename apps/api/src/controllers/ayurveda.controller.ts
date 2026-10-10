import { Request, Response, NextFunction } from 'express';
import { AyurvedaService } from '../services/ayurveda.service.js';
import { SubmitPrakritiAnswersInput, LogSymptomsInput } from '@ai-gurukul/validation';
import { AyurvedaRecommendationCategory } from '@ai-gurukul/types';

export class AyurvedaController {
  private ayurvedaService: AyurvedaService;

  constructor(ayurvedaService: AyurvedaService) {
    this.ayurvedaService = ayurvedaService;
  }

  public getQuestionnaire = (_req: Request, res: Response): void => {
    const questions = this.ayurvedaService.getQuestionnaire();
    const symptoms = this.ayurvedaService.getSymptomCatalog();

    res.status(200).json({
      success: true,
      data: {
        totalQuestions: questions.length,
        questions,
        availableSymptoms: symptoms,
      },
    });
  };

  public submitPrakriti = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { answers } = req.body as SubmitPrakritiAnswersInput;

      const profile = await this.ayurvedaService.submitPrakritiAssessment(userId, answers);

      res.status(200).json({
        success: true,
        data: profile,
        message: 'Prakriti constitution assessment completed successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const profile = await this.ayurvedaService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (err) {
      next(err);
    }
  };

  public logSymptoms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { symptoms, notes } = req.body as LogSymptomsInput;

      const updatedProfile = await this.ayurvedaService.logSymptoms(userId, symptoms, notes);

      res.status(200).json({
        success: true,
        data: updatedProfile,
        message: 'Vikriti symptoms logged and constitution recommendations updated',
      });
    } catch (err) {
      next(err);
    }
  };

  public getRecommendations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const category = req.query.category as AyurvedaRecommendationCategory | undefined;

      const profile = await this.ayurvedaService.getProfile(userId);
      let recommendations = profile?.recommendations || [];

      if (category) {
        recommendations = recommendations.filter((r) => r.category === category);
      }

      res.status(200).json({
        success: true,
        data: {
          dominantDosha: profile?.prakriti.dominantDosha || 'unassessed',
          currentImbalances: profile?.currentImbalances || [],
          recommendations,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
