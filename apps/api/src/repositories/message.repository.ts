import { BaseRepository, IMessageDocument, MessageModel } from '@ai-gurukul/database';
import { MessageCitation, TokenUsage } from '@ai-gurukul/types';
import { Types } from 'mongoose';

export interface CreateMessageData {
  conversationId: string | Types.ObjectId;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations?: MessageCitation[];
  tokenUsage?: TokenUsage;
}

export class MessageRepository extends BaseRepository<IMessageDocument> {
  constructor() {
    super(MessageModel);
  }

  public async createMessage(data: CreateMessageData): Promise<IMessageDocument> {
    const convObjectId =
      typeof data.conversationId === 'string'
        ? new Types.ObjectId(data.conversationId)
        : data.conversationId;

    const doc = new this.model({
      conversationId: convObjectId,
      sender: data.sender,
      content: data.content,
      citations: data.citations || [],
      tokenUsage: data.tokenUsage,
    });

    return doc.save();
  }

  public async findByConversationId(
    conversationId: string | Types.ObjectId,
    limit = 50
  ): Promise<IMessageDocument[]> {
    const convObjectId =
      typeof conversationId === 'string' ? new Types.ObjectId(conversationId) : conversationId;

    return this.model
      .find({ conversationId: convObjectId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  public async getRecentContextWindow(
    conversationId: string | Types.ObjectId,
    recentCount = 10
  ): Promise<IMessageDocument[]> {
    const convObjectId =
      typeof conversationId === 'string' ? new Types.ObjectId(conversationId) : conversationId;

    // Get last N messages ordered chronologically
    const messages = await this.model
      .find({ conversationId: convObjectId })
      .sort({ createdAt: -1 })
      .limit(recentCount)
      .exec();

    return messages.reverse();
  }
}
