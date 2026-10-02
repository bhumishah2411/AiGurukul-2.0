import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from './crypto.util.js';

describe('Crypto Utility Unit Tests', () => {
  it('hashes password with bcrypt (12 rounds) and verifies correctly', async () => {
    const plaintext = 'SacredVedaPass123!';
    const hash = await hashPassword(plaintext);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(plaintext);
    expect(hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$')).toBe(true);

    const isMatch = await verifyPassword(plaintext, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword('WrongPassword!', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('generates a cryptographically strong 80-character hex refresh token', () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();

    expect(token1).toHaveLength(80);
    expect(token2).toHaveLength(80);
    expect(token1).not.toBe(token2);
  });

  it('computes consistent SHA-256 hash of refresh tokens', () => {
    const token =
      '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);

    const differentHash = hashRefreshToken('different_token');
    expect(hash1).not.toBe(differentHash);
  });

  it('signs and verifies JWT access tokens with payload claims', () => {
    const secret = 'super_secret_jwt_key_with_at_least_32_characters';
    const payload = {
      sub: 'usr_vedic_108',
      email: 'arjuna@vedic.edu',
      displayName: 'Arjuna Pandava',
      role: 'scholar' as const,
    };

    const token = signAccessToken(payload, secret, '15m');
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyAccessToken(token, secret);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.displayName).toBe(payload.displayName);
    expect(decoded.role).toBe('scholar');
  });

  it('rejects tampered JWT access tokens or incorrect secret', () => {
    const secret = 'valid_secret_key_at_least_32_chars_long!';
    const wrongSecret = 'wrong_secret_key_at_least_32_chars_long!';
    const payload = {
      sub: 'usr_test',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'learner' as const,
    };

    const token = signAccessToken(payload, secret);

    expect(() => verifyAccessToken(token, wrongSecret)).toThrow();

    // Tamper with payload segment
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}xyz.${parts[2]}`;
    expect(() => verifyAccessToken(tamperedToken, secret)).toThrow();
  });
});
