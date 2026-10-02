import { OAuth2Client } from 'google-auth-library';
import { ApiConfig } from '@ai-gurukul/config';
import { Logger } from '@ai-gurukul/logging';
import { UnauthorizedError } from '@ai-gurukul/types';

export interface VerifiedGoogleProfile {
  googleId: string;
  email: string;
  displayName: string;
  picture?: string;
  isEmailVerified: boolean;
}

export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly clientId?: string;
  private readonly logger: Logger;

  constructor(config: ApiConfig, logger: Logger) {
    this.clientId = config.GOOGLE_CLIENT_ID;
    this.client = new OAuth2Client(this.clientId);
    this.logger = logger;
  }

  /**
   * Verifies Google ID Token. Supports production OAuth validation
   * as well as deterministic test mock tokens for local testing.
   */
  public async verifyIdToken(idToken: string): Promise<VerifiedGoogleProfile> {
    // 1. Support test mock tokens (for automated test suites and offline dev)
    if (idToken.startsWith('mock-google-token:')) {
      try {
        const rawJson = idToken.replace('mock-google-token:', '');
        const parsed = JSON.parse(rawJson);
        return {
          googleId: parsed.sub || parsed.googleId || 'mock-google-id-123',
          email: (parsed.email || 'mock.user@example.com').toLowerCase().trim(),
          displayName: parsed.name || parsed.displayName || 'Vedic Seeker',
          picture: parsed.picture,
          isEmailVerified: parsed.email_verified ?? true,
        };
      } catch {
        throw new UnauthorizedError('Invalid mock Google token payload');
      }
    }

    // 2. Production Google verification via google-auth-library
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new UnauthorizedError('Invalid Google token: missing required claims');
      }

      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase().trim(),
        displayName: payload.name || payload.email.split('@')[0] || 'Vedic Seeker',
        picture: payload.picture,
        isEmailVerified: payload.email_verified ?? false,
      };
    } catch (err: unknown) {
      this.logger.warn({ err }, 'Google ID Token verification failed');
      throw new UnauthorizedError('Failed to verify Google identity token');
    }
  }
}
