import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service.js';
import { DocumentUploadInput, DocumentListQueryInput } from '@ai-gurukul/validation';

export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  public upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as DocumentUploadInput;
      const userId = (req as Request & { user?: { userId: string } }).user?.userId;

      const document = await this.documentService.uploadDocument(payload, userId);
      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as DocumentListQueryInput;
      const result = await this.documentService.listDocuments(query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.documentService.getDocumentById(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.documentService.deleteDocument(id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
