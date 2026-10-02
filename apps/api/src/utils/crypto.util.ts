import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { JwtUserPayload } from '@ai-gurukul/types';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a cryptographically strong random token for session refresh.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Hashes a refresh token using SHA-256 for persistent database storage.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Signs a short-lived JSON Web Token (JWT) for API access.
 */
export function signAccessToken(
  payload: JwtUserPayload,
  secret: string,
  expiresIn: string | number = '15m'
): string {
  const options: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: expiresIn as any,
  };
  return jwt.sign(payload, secret, options);
}

/**
 * Verifies and decodes an access token.
 */
export function verifyAccessToken(token: string, secret: string): JwtUserPayload {
  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256'],
  });
  return decoded as JwtUserPayload;
}
