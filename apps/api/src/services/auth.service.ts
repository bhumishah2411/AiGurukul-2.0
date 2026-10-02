import { ApiConfig } from '@ai-gurukul/config';
import { Logger } from '@ai-gurukul/logging';
import {
  AuthResponseData,
  ChangePasswordDTO,
  ConflictError,
  LoginRequestDTO,
  NotFoundError,
  RegisterRequestDTO,
  UnauthorizedError,
  BadRequestError,
  UpdateProfileDTO,
  UserDTO,
} from '@ai-gurukul/types';
import { UserRepository, SessionRepository } from '../repositories/index.js';
import { GoogleAuthService } from './google-auth.service.js';
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from '../utils/crypto.util.js';

export interface ClientConnectionInfo {
  ipAddress?: string;
  userAgent?: string;
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export class AuthService {
  private readonly userRepo: UserRepository;
  private readonly sessionRepo: SessionRepository;
  private readonly googleAuthService: GoogleAuthService;
  private readonly config: ApiConfig;
  private readonly logger: Logger;

  constructor(
    userRepo: UserRepository,
    sessionRepo: SessionRepository,
    googleAuthService: GoogleAuthService,
    config: ApiConfig,
    logger: Logger
  ) {
    this.userRepo = userRepo;
    this.sessionRepo = sessionRepo;
    this.googleAuthService = googleAuthService;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Registers a new user with email and password.
   */
  public async register(
    dto: RegisterRequestDTO,
    clientInfo: ClientConnectionInfo = {}
  ): Promise<AuthResponseData> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepo.createUser({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
      role: 'learner',
      preferences: {
        defaultPersona: dto.preferredPersona || 'krishna',
        language: dto.language || 'en',
        notificationsEnabled: true,
      },
      isEmailVerified: false,
    });

    const tokens = await this.createSessionAndIssueTokens(user._id.toString(), user, clientInfo);

    this.logger.info(
      { userId: user._id.toString(), email: user.email },
      'User registered successfully'
    );

    return {
      user: user.toDTO(),
      tokens,
    };
  }

  /**
   * Authenticates user via email and password.
   */
  public async login(
    dto: LoginRequestDTO,
    clientInfo: ClientConnectionInfo = {}
  ): Promise<AuthResponseData> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.createSessionAndIssueTokens(user._id.toString(), user, clientInfo);

    this.logger.info({ userId: user._id.toString() }, 'User logged in successfully');

    return {
      user: user.toDTO(),
      tokens,
    };
  }

  /**
   * Authenticates or registers a user via Google OAuth 2.0 ID Token.
   */
  public async googleLogin(
    idToken: string,
    clientInfo: ClientConnectionInfo = {}
  ): Promise<AuthResponseData> {
    const profile = await this.googleAuthService.verifyIdToken(idToken);

    // 1. Check if user with this Google account exists
    let user = await this.userRepo.findByOAuth('google', profile.googleId);

    if (!user) {
      // 2. Check if a user with this email exists (link account)
      const existingUserWithEmail = await this.userRepo.findByEmail(profile.email);

      if (existingUserWithEmail) {
        user = await this.userRepo.linkOAuth(
          existingUserWithEmail._id.toString(),
          'google',
          profile.googleId,
          profile.email
        );
        this.logger.info(
          { userId: existingUserWithEmail._id.toString() },
          'Linked Google identity to existing account'
        );
      } else {
        // 3. Create a new user with Google identity
        user = await this.userRepo.createUser({
          email: profile.email,
          displayName: profile.displayName,
          isEmailVerified: profile.isEmailVerified,
          role: 'learner',
          oauthProviders: [
            {
              provider: 'google',
              providerId: profile.googleId,
              email: profile.email,
            },
          ],
        });
        this.logger.info({ userId: user._id.toString() }, 'Created new user via Google OAuth');
      }
    }

    if (!user) {
      throw new UnauthorizedError('Unable to authenticate with Google identity');
    }

    const tokens = await this.createSessionAndIssueTokens(user._id.toString(), user, clientInfo);

    return {
      user: user.toDTO(),
      tokens,
    };
  }

  /**
   * Rotates refresh token and issues a new access token.
   */
  public async refreshSession(
    refreshToken: string,
    clientInfo: ClientConnectionInfo = {}
  ): Promise<AuthResponseData> {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const session = await this.sessionRepo.findValidSessionByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findById(session.userId.toString());
    if (!user) {
      await this.sessionRepo.invalidateSession(session._id.toString());
      throw new UnauthorizedError('User account not found');
    }

    // Refresh Token Rotation (RTR): Invalidate old refresh token and issue new one
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.sessionRepo.rotateSessionToken(
      session._id.toString(),
      newRefreshTokenHash,
      newExpiresAt
    );

    const newAccessToken = signAccessToken(
      {
        sub: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      this.config.JWT_ACCESS_SECRET
    );

    return {
      user: user.toDTO(),
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  /**
   * Logs out the user by invalidating the refresh token session.
   */
  public async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = hashRefreshToken(refreshToken);
      await this.sessionRepo.invalidateByTokenHash(tokenHash);
    }
  }

  /**
   * Revokes all active sessions for a user (e.g. security reset).
   */
  public async logoutAll(userId: string): Promise<void> {
    await this.sessionRepo.invalidateAllUserSessions(userId);
  }

  /**
   * Retrieves user profile by user ID.
   */
  public async getProfile(userId: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user.toDTO();
  }

  /**
   * Updates user preferences or display name.
   */
  public async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserDTO> {
    const updated = await this.userRepo.updateProfile(userId, {
      displayName: dto.displayName,
      preferences: dto.preferences,
    });

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return updated.toDTO();
  }

  /**
   * Changes password and revokes all other sessions.
   */
  public async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestError('OAuth users cannot change password without a linked password');
    }

    const isMatch = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.userRepo.updatePassword(userId, newHash);

    // Invalidate all existing sessions for security
    await this.sessionRepo.invalidateAllUserSessions(userId);
  }

  /**
   * Helper to create session and issue initial tokens.
   */
  private async createSessionAndIssueTokens(
    userId: string,
    user: { _id: unknown; email: string; displayName: string; role: string },
    clientInfo: ClientConnectionInfo
  ) {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await this.sessionRepo.createSession({
      userId,
      refreshTokenHash,
      userAgent: clientInfo.userAgent,
      ipAddress: clientInfo.ipAddress,
      expiresAt,
    });

    const accessToken = signAccessToken(
      {
        sub: userId,
        email: user.email,
        displayName: user.displayName,
        role: user.role as any,
      },
      this.config.JWT_ACCESS_SECRET
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
