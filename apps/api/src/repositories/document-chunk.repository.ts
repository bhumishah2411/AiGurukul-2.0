import { BaseRepository, IDocumentChunkRecord, DocumentChunkModel } from '@ai-gurukul/database';
import { Types } from 'mongoose';

export class DocumentChunkRepository extends BaseRepository<IDocumentChunkRecord> {
  constructor() {
    super(DocumentChunkModel);
  }

  public async findByDocumentId(documentId: string): Promise<IDocumentChunkRecord[]> {
    if (!Types.ObjectId.isValid(documentId)) {
      return [];
    }
    return this.model
      .find({ documentId: new Types.ObjectId(documentId) })
      .sort({ chunkIndex: 1 })
      .exec();
  }

  public async deleteByDocumentId(documentId: string): Promise<number> {
    if (!Types.ObjectId.isValid(documentId)) {
      return 0;
    }
    const result = await this.model
      .deleteMany({ documentId: new Types.ObjectId(documentId) })
      .exec();
    return result.deletedCount;
  }

  public async countTotalChunks(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  public async createMany(chunks: Array<Record<string, unknown>>): Promise<IDocumentChunkRecord[]> {
    return this.model.insertMany(chunks) as unknown as Promise<IDocumentChunkRecord[]>;
  }
}
