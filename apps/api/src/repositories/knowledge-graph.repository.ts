import {
  BaseRepository,
  IKnowledgeNodeDocument,
  IKnowledgeEdgeDocument,
  KnowledgeNodeModel,
  KnowledgeEdgeModel,
  seedCanonicalKnowledgeGraph,
} from '@ai-gurukul/database';
import { GraphEntityType, GraphRelationshipType } from '@ai-gurukul/types';
import { FilterQuery, Model } from 'mongoose';

export class KnowledgeGraphRepository extends BaseRepository<IKnowledgeNodeDocument> {
  private readonly nodeModel: Model<IKnowledgeNodeDocument>;
  private readonly edgeModel: Model<IKnowledgeEdgeDocument>;

  constructor(
    nodeModel: Model<IKnowledgeNodeDocument> = KnowledgeNodeModel,
    edgeModel: Model<IKnowledgeEdgeDocument> = KnowledgeEdgeModel
  ) {
    super(nodeModel);
    this.nodeModel = nodeModel;
    this.edgeModel = edgeModel;
  }

  public async ensureSeeded(): Promise<{ nodesSeeded: number; edgesSeeded: number }> {
    return seedCanonicalKnowledgeGraph(this.nodeModel, this.edgeModel);
  }

  public async findNodeBySlug(slug: string): Promise<IKnowledgeNodeDocument | null> {
    return this.nodeModel.findOne({ slug: slug.trim().toLowerCase() }).exec();
  }

  public async getAllNodes(
    typeFilter?: GraphEntityType,
    limit: number = 100
  ): Promise<IKnowledgeNodeDocument[]> {
    const filter: FilterQuery<IKnowledgeNodeDocument> = {};
    if (typeFilter) {
      filter.entityType = typeFilter;
    }
    return this.nodeModel.find(filter).limit(limit).sort({ name: 1 }).exec();
  }

  public async getAllEdges(limit: number = 500): Promise<IKnowledgeEdgeDocument[]> {
    return this.edgeModel.find().limit(limit).exec();
  }

  public async getEdgesForNode(slug: string): Promise<{
    outgoing: IKnowledgeEdgeDocument[];
    incoming: IKnowledgeEdgeDocument[];
  }> {
    const cleanSlug = slug.trim().toLowerCase();
    const [outgoing, incoming] = await Promise.all([
      this.edgeModel.find({ sourceSlug: cleanSlug }).exec(),
      this.edgeModel.find({ targetSlug: cleanSlug }).exec(),
    ]);

    return { outgoing, incoming };
  }

  public async findNeighbors(slug: string): Promise<IKnowledgeNodeDocument[]> {
    const { outgoing, incoming } = await this.getEdgesForNode(slug);
    const neighborSlugs = new Set<string>();

    for (const e of outgoing) {
      neighborSlugs.add(e.targetSlug);
    }
    for (const e of incoming) {
      neighborSlugs.add(e.sourceSlug);
    }

    if (neighborSlugs.size === 0) {
      return [];
    }

    return this.nodeModel
      .find({ slug: { $in: Array.from(neighborSlugs) } })
      .sort({ name: 1 })
      .exec();
  }

  public async searchNodes(
    query?: string,
    type?: GraphEntityType,
    tag?: string,
    limit: number = 20
  ): Promise<IKnowledgeNodeDocument[]> {
    const filter: FilterQuery<IKnowledgeNodeDocument> = {};

    if (type) {
      filter.entityType = type;
    }

    if (tag) {
      filter.tags = { $in: [tag.toLowerCase()] };
    }

    if (query && query.trim().length > 0) {
      const q = query.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { slug: regex },
        { name: regex },
        { sanskritName: regex },
        { summary: regex },
        { tags: regex },
      ];
    }

    return this.nodeModel.find(filter).limit(limit).sort({ name: 1 }).exec();
  }

  public async getStatistics(): Promise<{
    totalNodes: number;
    totalEdges: number;
    entityTypeCounts: Record<GraphEntityType, number>;
    relationshipCounts: Record<GraphRelationshipType, number>;
  }> {
    const [totalNodes, totalEdges, nodesByType, edgesByRel] = await Promise.all([
      this.nodeModel.countDocuments().exec(),
      this.edgeModel.countDocuments().exec(),
      this.nodeModel.aggregate<{ _id: GraphEntityType; count: number }>([
        { $group: { _id: '$entityType', count: { $sum: 1 } } },
      ]),
      this.edgeModel.aggregate<{ _id: GraphRelationshipType; count: number }>([
        { $group: { _id: '$relationship', count: { $sum: 1 } } },
      ]),
    ]);

    const entityTypeCounts: Record<GraphEntityType, number> = {
      concept: 0,
      text: 0,
      tradition: 0,
      author: 0,
      practice: 0,
    };
    for (const row of nodesByType) {
      if (row._id in entityTypeCounts) {
        entityTypeCounts[row._id] = row.count;
      }
    }

    const relationshipCounts: Record<GraphRelationshipType, number> = {
      expounds: 0,
      authored_by: 0,
      affiliated_with: 0,
      critiques: 0,
      influences: 0,
      part_of: 0,
      related_to: 0,
    };
    for (const row of edgesByRel) {
      if (row._id in relationshipCounts) {
        relationshipCounts[row._id] = row.count;
      }
    }

    return {
      totalNodes,
      totalEdges,
      entityTypeCounts,
      relationshipCounts,
    };
  }
}
