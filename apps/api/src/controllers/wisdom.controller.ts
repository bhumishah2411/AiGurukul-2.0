import { Request, Response, NextFunction } from 'express';
import { WisdomService } from '../services/wisdom.service.js';
import {
  CreateConversationRequestDTO,
  SendMessageRequestDTO,
  WisdomDomain,
  WisdomPersona,
} from '@ai-gurukul/types';

export class WisdomController {
  private readonly wisdomService: WisdomService;

  constructor(wisdomService: WisdomService) {
    this.wisdomService = wisdomService;
  }

  public getPersonas = async (_req: Request, res: Response): Promise<void> => {
    const personas = this.wisdomService.getPersonas();
    res.status(200).json({
      success: true,
      data: { personas },
    });
  };

  public startConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { persona, title, initialMessage } = req.body as CreateConversationRequestDTO;

      const conversation = await this.wisdomService.startConversation(
        userId,
        persona,
        title,
        initialMessage
      );

      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (err) {
      next(err);
    }
  };

  public listConversations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const persona = req.query.persona as WisdomPersona | undefined;
      const status = req.query.status as string | undefined;

      const result = await this.wisdomService.getUserConversations(
        userId,
        { persona, status },
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public getConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;

      const result = await this.wisdomService.getConversationWithMessages(id, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public archiveConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;

      await this.wisdomService.archiveConversation(id, userId);

      res.status(200).json({
        success: true,
        data: { message: 'Conversation archived successfully' },
      });
    } catch (err) {
      next(err);
    }
  };

  public sendMessageSync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;
      const { content } = req.body as SendMessageRequestDTO;

      const message = await this.wisdomService.sendMessageSync(id, userId, content);

      res.status(201).json({
        success: true,
        data: { message },
      });
    } catch (err) {
      next(err);
    }
  };

  public streamMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const { id } = req.params;
      const content =
        (req.body && req.body.content) || (req.query && (req.query.content as string));

      if (!content || typeof content !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Message content is required for streaming' },
        });
        return;
      }

      // Configure Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      await this.wisdomService.streamMessage(id, userId, content, {
        onToken: (token: string) => {
          res.write(`event: token\ndata: ${JSON.stringify({ token, conversationId: id })}\n\n`);
        },
        onCitation: (citation) => {
          res.write(
            `event: citation\ndata: ${JSON.stringify({ citation, conversationId: id })}\n\n`
          );
        },
        onDone: (data) => {
          res.write(`event: done\ndata: ${JSON.stringify(data)}\n\n`);
          res.end();
        },
        onError: (err) => {
          res.write(
            `event: error\ndata: ${JSON.stringify({ code: 'STREAM_ERROR', message: err.message })}\n\n`
          );
          res.end();
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public getVerses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const domain = req.query.domain as WisdomDomain | undefined;
      const theme = req.query.theme as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.wisdomService.getWisdomVerses(
        { domain, theme, search },
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
