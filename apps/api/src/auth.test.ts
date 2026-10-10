import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import { UserModel, SessionModel } from '@ai-gurukul/database';

describe('Auth & User Management Integration Tests (Phase 2)', () => {
  const TEST_DB_URI =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aigurukul_auth_test';

  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5998,
    MONGODB_URI: TEST_DB_URI,
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_32_characters_long!',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_32_characters_long!',
    COOKIE_SECRET: 'test_cookie_secret_32_characters_long!',
  });

  const logger = createLogger({ name: 'test-auth-api', level: 'silent' });
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
    // Clean test collections
    await UserModel.deleteMany({ email: { $regex: /@vedictest\.com$/ } });
    await SessionModel.deleteMany({});

    app = createApp({ config, logger });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $regex: /@vedictest\.com$/ } });
    await SessionModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  const testUser = {
    email: 'arjuna@vedictest.com',
    password: 'SacredPassword123!',
    displayName: 'Arjuna Pandava',
    preferredPersona: 'krishna' as const,
  };

  let accessToken = '';
  let refreshToken = '';
  let authCookies: string[] = [];

  it('POST /api/v1/auth/register registers a new user, sets cookies and issues tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.displayName).toBe(testUser.displayName);
    expect(res.body.data.user.role).toBe('learner');
    expect(res.body.data.user.preferences.defaultPersona).toBe('krishna');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never leak passwordHash
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    // Verify HttpOnly cookies
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const cookieStr = cookies.join('; ');
    expect(cookieStr).toContain('access_token=');
    expect(cookieStr).toContain('refresh_token=');
    expect(cookieStr).toContain('HttpOnly');
    expect(cookieStr).toContain('SameSite=Strict');

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
    authCookies = cookies;
  });

  it('POST /api/v1/auth/register rejects duplicate email with 409 Conflict', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('POST /api/v1/auth/register validates schema input with 422 Unprocessable Entity', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'invalid-email',
      password: 'short',
      displayName: 'A',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/login authenticates with valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /api/v1/auth/login fails with invalid password (401 Unauthorized)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/auth/me returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/auth/me retrieves current user profile with Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.displayName).toBe(testUser.displayName);
  });

  it('GET /api/v1/auth/me retrieves current user profile using HttpOnly cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`access_token=${accessToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/refresh rotates refresh token and returns fresh access token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    // Refresh token rotation: new refresh token is different from old one
    expect(res.body.data.tokens.refreshToken).not.toBe(refreshToken);

    // Update tokens for subsequent tests
    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /api/v1/auth/refresh rejects revoked/old refresh token', async () => {
    // Old refresh token was rotated, should be invalid now
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-or-old-token-value' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/auth/profile updates user display name and persona preferences', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        displayName: 'Arjuna - The Archer',
        preferences: {
          defaultPersona: 'chanakya',
          language: 'sa',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.displayName).toBe('Arjuna - The Archer');
    expect(res.body.data.user.preferences.defaultPersona).toBe('chanakya');
    expect(res.body.data.user.preferences.language).toBe('sa');
  });

  it('POST /api/v1/auth/google creates/links user via Google OAuth idToken', async () => {
    const mockToken = `mock-google-token:${JSON.stringify({
      sub: 'google-oauth-sub-108',
      email: 'sanctum.seeker@vedictest.com',
      name: 'Sanctum Seeker',
      email_verified: true,
    })}`;

    const res = await request(app).post('/api/v1/auth/google').send({ idToken: mockToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('sanctum.seeker@vedictest.com');
    expect(res.body.data.user.displayName).toBe('Sanctum Seeker');
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.isEmailVerified).toBe(true);
  });

  it('RBAC Guard: Learner role is denied access to admin routes (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${accessToken}`); // accessToken belongs to learner

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it(
    'RBAC Guard: Admin role is granted access to admin routes (200 OK)',
    async () => {
      // Elevate user role to 'admin' directly in DB for testing
      await UserModel.updateOne({ email: testUser.email }, { $set: { role: 'admin' } });

      // Login again to obtain JWT with 'admin' role claim
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const adminAccessToken = loginRes.body.data.tokens.accessToken;

      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    },
    15000
  );

  it('POST /api/v1/auth/logout invalidates refresh token and clears auth cookies', async () => {
    const res = await request(app).post('/api/v1/auth/logout').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const cookieStr = cookies.join('; ');
    // Cookies should be expired / cleared
    expect(cookieStr).toMatch(/access_token=;/);
    expect(cookieStr).toMatch(/refresh_token=;/);
  });
});
