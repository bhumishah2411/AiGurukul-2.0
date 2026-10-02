import { BaseRepository, IConversationDocument, ConversationModel } from '@ai-gurukul/database';
import { PaginatedResult, PaginationParams, WisdomPersona } from '@ai-gurukul/types';
import { Types, FilterQuery } from 'mongoose';

export interface CreateConversationData {
  userId: string | Types.ObjectId;
  persona: WisdomPersona;
  title?: string;
}

export class ConversationRepository extends BaseRepository<IConversationDocument> {
  constructor() {
    super(ConversationModel);
  }

  public async createConversation(data: CreateConversationData): Promise<IConversationDocument> {
    const userObjectId =
      typeof data.userId === 'string' ? new Types.ObjectId(data.userId) : data.userId;

    const doc = new this.model({
      userId: userObjectId,
      persona: data.persona,
      title: data.title || 'Sacred Inquiry',
      status: 'active',
      lastMessageAt: new Date(),
      messageCount: 0,
    });

    return doc.save();
  }

  public async findByIdAndUser(
    id: string,
    userId: string | Types.ObjectId
  ): Promise<IConversationDocument | null> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.model
      .findOne({
        _id: new Types.ObjectId(id),
        userId: userObjectId,
      })
      .exec();
  }

  public async findUserConversations(
    userId: string | Types.ObjectId,
    filters: { persona?: WisdomPersona; status?: string } = {},
    params: PaginationParams = {}
  ): Promise<PaginatedResult<IConversationDocument>> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const query: FilterQuery<IConversationDocument> = { userId: userObjectId };

    if (filters.persona) {
      query.persona = filters.persona;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    return this.paginate(query, params, undefined, { lastMessageAt: -1 });
  }

  public async updateActivity(
    id: string,
    incrementMessageCount = 1,
    contextSummary?: string
  ): Promise<IConversationDocument | null> {
    const update: Record<string, unknown> = {
      $set: { lastMessageAt: new Date() },
      $inc: { messageCount: incrementMessageCount },
    };

    if (contextSummary) {
      (update.$set as Record<string, unknown>).contextSummary = contextSummary;
    }

    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  public async archiveConversation(
    id: string,
    userId: string | Types.ObjectId
  ): Promise<IConversationDocument | null> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    return this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: userObjectId },
        { $set: { status: 'archived' } },
        { new: true }
      )
      .exec();
  }
}
