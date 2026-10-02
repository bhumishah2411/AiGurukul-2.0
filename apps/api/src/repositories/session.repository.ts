import { BaseRepository, ISessionDocument, SessionModel } from '@ai-gurukul/database';
import { Types } from 'mongoose';

export interface CreateSessionData {
  userId: string | Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export class SessionRepository extends BaseRepository<ISessionDocument> {
  constructor() {
    super(SessionModel);
  }

  public async createSession(data: CreateSessionData): Promise<ISessionDocument> {
    const session = new this.model({
      userId: typeof data.userId === 'string' ? new Types.ObjectId(data.userId) : data.userId,
      refreshTokenHash: data.refreshTokenHash,
      userAgent: data.userAgent || 'unknown',
      ipAddress: data.ipAddress || 'unknown',
      expiresAt: data.expiresAt,
      isValid: true,
    });

    return session.save();
  }

  public async findValidSessionByTokenHash(
    refreshTokenHash: string
  ): Promise<ISessionDocument | null> {
    return this.model
      .findOne({
        refreshTokenHash,
        isValid: true,
        expiresAt: { $gt: new Date() },
      })
      .exec();
  }

  public async rotateSessionToken(
    sessionId: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date
  ): Promise<ISessionDocument | null> {
    return this.model
      .findByIdAndUpdate(
        sessionId,
        {
          $set: {
            refreshTokenHash: newRefreshTokenHash,
            expiresAt: newExpiresAt,
            isValid: true,
          },
        },
        { new: true }
      )
      .exec();
  }

  public async invalidateSession(sessionId: string): Promise<void> {
    await this.model.findByIdAndUpdate(sessionId, { $set: { isValid: false } }).exec();
  }

  public async invalidateByTokenHash(refreshTokenHash: string): Promise<void> {
    await this.model.updateMany({ refreshTokenHash }, { $set: { isValid: false } }).exec();
  }

  public async invalidateAllUserSessions(userId: string | Types.ObjectId): Promise<void> {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    await this.model.updateMany({ userId: userObjectId }, { $set: { isValid: false } }).exec();
  }
}
