import {
  BaseRepository,
  IDocumentRecord,
  DocumentModel,
  seedCanonicalDocuments,
} from '@ai-gurukul/database';
import { DocumentStatus, PaginatedResult, PaginationParams } from '@ai-gurukul/types';
import { FilterQuery } from 'mongoose';

export class DocumentRepository extends BaseRepository<IDocumentRecord> {
  constructor() {
    super(DocumentModel);
  }

  public async ensureSeeded(): Promise<{ documentsCreated: number; chunksCreated: number }> {
    return seedCanonicalDocuments();
  }

  public async findByStorageKey(storageKey: string): Promise<IDocumentRecord | null> {
    return this.model.findOne({ storageKey }).exec();
  }

  public async findWithPagination(
    query: {
      domain?: string;
      status?: DocumentStatus;
      search?: string;
    },
    params: PaginationParams = {}
  ): Promise<PaginatedResult<IDocumentRecord>> {
    const filter: FilterQuery<IDocumentRecord> = {};

    if (query.domain) {
      filter.domain = query.domain.toLowerCase();
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ title: regex }, { author: regex }, { domain: regex }, { fileName: regex }];
    }

    return this.paginate(filter, params, undefined, { createdAt: -1 });
  }

  public async updateStatus(
    id: string,
    status: DocumentStatus,
    stats?: { chunkCount?: number; tokenCount?: number; errorMessage?: string }
  ): Promise<IDocumentRecord | null> {
    const updateDoc: Record<string, unknown> = { status };
    if (stats?.chunkCount !== undefined) updateDoc.chunkCount = stats.chunkCount;
    if (stats?.tokenCount !== undefined) updateDoc.tokenCount = stats.tokenCount;
    if (stats?.errorMessage !== undefined) updateDoc.errorMessage = stats.errorMessage;

    return this.model.findByIdAndUpdate(id, { $set: updateDoc }, { new: true }).exec();
  }

  public async getStats(): Promise<{
    totalDocuments: number;
    indexedDocuments: number;
    totalTokens: number;
    domainCounts: Record<string, number>;
  }> {
    const [totalDocuments, indexedDocuments, domainAgg, tokenAgg] = await Promise.all([
      this.model.countDocuments(),
      this.model.countDocuments({ status: 'indexed' }),
      this.model.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$domain', count: { $sum: 1 } } },
      ]),
      this.model.aggregate<{ _id: null; totalTokens: number }>([
        { $group: { _id: null, totalTokens: { $sum: '$tokenCount' } } },
      ]),
    ]);

    const domainCounts: Record<string, number> = {};
    for (const item of domainAgg) {
      domainCounts[item._id] = item.count;
    }

    return {
      totalDocuments,
      indexedDocuments,
      totalTokens: tokenAgg[0]?.totalTokens ?? 0,
      domainCounts,
    };
  }
}
