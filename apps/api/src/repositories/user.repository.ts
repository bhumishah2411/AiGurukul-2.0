import { BaseRepository, IUserDocument, UserModel } from '@ai-gurukul/database';
import { OAuthProviderInfo, UserPreferences, UserRole } from '@ai-gurukul/types';

export interface CreateUserData {
  email: string;
  displayName: string;
  passwordHash?: string | null;
  role?: UserRole;
  oauthProviders?: OAuthProviderInfo[];
  preferences?: Partial<UserPreferences>;
  isEmailVerified?: boolean;
}

export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  public async findByOAuth(provider: 'google', providerId: string): Promise<IUserDocument | null> {
    return this.model
      .findOne({
        oauthProviders: {
          $elemMatch: { provider, providerId },
        },
      })
      .exec();
  }

  public async linkOAuth(
    userId: string,
    provider: 'google',
    providerId: string,
    email?: string
  ): Promise<IUserDocument | null> {
    return this.model
      .findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            oauthProviders: { provider, providerId, email },
          },
          $set: { isEmailVerified: true },
        },
        { new: true }
      )
      .exec();
  }

  public async createUser(data: CreateUserData): Promise<IUserDocument> {
    const preferences: UserPreferences = {
      defaultPersona: data.preferences?.defaultPersona || 'krishna',
      language: data.preferences?.language || 'en',
      notificationsEnabled: data.preferences?.notificationsEnabled ?? true,
    };

    const doc = new this.model({
      email: data.email.toLowerCase().trim(),
      displayName: data.displayName.trim(),
      passwordHash: data.passwordHash || null,
      role: data.role || 'learner',
      oauthProviders: data.oauthProviders || [],
      preferences,
      isEmailVerified: data.isEmailVerified ?? false,
    });

    return doc.save();
  }

  public async updatePassword(userId: string, passwordHash: string): Promise<IUserDocument | null> {
    return this.model.findByIdAndUpdate(userId, { $set: { passwordHash } }, { new: true }).exec();
  }

  public async updateProfile(
    userId: string,
    updates: {
      displayName?: string;
      preferences?: Partial<UserPreferences>;
    }
  ): Promise<IUserDocument | null> {
    const updateQuery: Record<string, unknown> = {};

    if (updates.displayName !== undefined) {
      updateQuery['displayName'] = updates.displayName.trim();
    }

    if (updates.preferences) {
      if (updates.preferences.defaultPersona !== undefined) {
        updateQuery['preferences.defaultPersona'] = updates.preferences.defaultPersona;
      }
      if (updates.preferences.language !== undefined) {
        updateQuery['preferences.language'] = updates.preferences.language;
      }
      if (updates.preferences.notificationsEnabled !== undefined) {
        updateQuery['preferences.notificationsEnabled'] = updates.preferences.notificationsEnabled;
      }
    }

    return this.model.findByIdAndUpdate(userId, { $set: updateQuery }, { new: true }).exec();
  }
}
