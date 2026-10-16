import { Request, Response, NextFunction } from 'express';
import { TranslationService } from '../services/translation.service.js';
import { EtymologyService } from '../services/etymology.service.js';
import {
  TranslateRequestSchema,
  EtymologyQuerySchema,
  ManuscriptQuerySchema,
} from '@ai-gurukul/validation';
import { SupportedLanguage } from '@ai-gurukul/types';

export class LanguageController {
  constructor(
    private translationService: TranslationService,
    private etymologyService: EtymologyService
  ) {}

  getSupportedLanguages = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const languages = this.translationService.getSupportedLanguages();
      res.status(200).json({ success: true, data: languages });
    } catch (err) {
      next(err);
    }
  };

  getKeyboardLayout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lang = (req.params.language || req.query.language || 'sa') as SupportedLanguage;
      const layout = this.translationService.getVirtualKeyboardLayout(lang);
      res.status(200).json({ success: true, data: layout });
    } catch (err) {
      next(err);
    }
  };

  translate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = TranslateRequestSchema.parse(req.body);
      const result = await this.translationService.translateText(parsed);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getManuscripts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = ManuscriptQuerySchema.parse(req.query);
      const manuscripts = await this.translationService.getManuscripts(parsed);
      res.status(200).json({ success: true, data: manuscripts });
    } catch (err) {
      next(err);
    }
  };

  getManuscriptBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug;
      const manuscript = await this.translationService.getManuscriptBySlug(slug);
      res.status(200).json({ success: true, data: manuscript });
    } catch (err) {
      next(err);
    }
  };

  getEtymologies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.query.q || req.query.root || '') as string;
      const lang = req.query.language as SupportedLanguage | undefined;

      if (query) {
        const results = this.etymologyService.searchEtymologies(query, lang);
        res.status(200).json({ success: true, data: results });
      } else {
        const all = this.etymologyService.getAllEtymologies();
        res.status(200).json({ success: true, data: all });
      }
    } catch (err) {
      next(err);
    }
  };

  getEtymologyByRoot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const root = req.params.root;
      const parsed = EtymologyQuerySchema.parse({ root });
      const entry = this.etymologyService.getEtymologyByRoot(parsed.root);
      res.status(200).json({ success: true, data: entry });
    } catch (err) {
      next(err);
    }
  };
}
