import { Request, Response, NextFunction } from 'express';
import { KnowledgeGraphService } from '../services/knowledge-graph.service.js';
import { GraphOverviewQuery, GraphSearchQuery, GraphPathQuery } from '@ai-gurukul/validation';
import { GraphEntityType } from '@ai-gurukul/types';

export class KnowledgeGraphController {
  constructor(private readonly graphService: KnowledgeGraphService) {}

  public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GraphOverviewQuery;
      const type = query.type as GraphEntityType | undefined;
      const limit = query.limit || 100;

      const overview = await this.graphService.getOverview(type, limit);
      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  };

  public getNodeDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const details = await this.graphService.getNodeDetails(slug);
      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      next(error);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GraphSearchQuery;
      const results = await this.graphService.search(
        query.q,
        query.type as GraphEntityType | undefined,
        query.tag,
        query.limit
      );

      res.status(200).json({
        success: true,
        data: {
          total: results.length,
          nodes: results,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public findPath = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as GraphPathQuery;
      const pathResult = await this.graphService.findShortestPath(
        query.source,
        query.target,
        query.maxDepth || 4
      );

      res.status(200).json({
        success: true,
        data: pathResult,
      });
    } catch (error) {
      next(error);
    }
  };
}
