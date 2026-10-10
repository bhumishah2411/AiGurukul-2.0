import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import { UserModel, QuizModel, QuizAttemptModel, seedCanonicalQuizzes } from '@ai-gurukul/database';

describe('Vedic Quizzes & Dynamic Assessment Integration Tests (Phase 5B)', () => {
  const TEST_DB_URI =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aigurukul_quiz_test';

  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5995,
    MONGODB_URI: TEST_DB_URI,
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_32_characters_long!',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_32_characters_long!',
    COOKIE_SECRET: 'test_cookie_secret_32_characters_long!',
  });

  const logger = createLogger({ name: 'test-quiz-api', level: 'silent' });
  let app: ReturnType<typeof createApp>;
  let seekerToken = '';
  let seekerId = '';
  let seededQuizId = '';

  const testUser = {
    email: 'quiz.sadhaka@vedictest.com',
    password: 'SacredPassword123!',
    displayName: 'Quiz Sadhaka',
    preferredPersona: 'krishna' as const,
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    await UserModel.deleteMany({ email: testUser.email });
    await QuizModel.deleteMany({});
    await QuizAttemptModel.deleteMany({});

    // Seed canonical quizzes
    await seedCanonicalQuizzes();

    app = createApp({ config, logger });

    // Register test user
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(regRes.status).toBe(201);
    seekerToken = regRes.body.data.tokens.accessToken;
    seekerId = regRes.body.data.user.id;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
    await QuizModel.deleteMany({});
    await QuizAttemptModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/quizzes returns list of canonical quizzes with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/quizzes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);

    seededQuizId = res.body.data[0].id;
  });

  it('GET /api/v1/quizzes?domain=gita filters quizzes accurately', async () => {
    const res = await request(app).get('/api/v1/quizzes?domain=gita');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.data.forEach((q: any) => {
      expect(q.domain).toBe('gita');
    });
  });

  it('GET /api/v1/quizzes/:id returns client quiz without leaking correctIndex or explanations', async () => {
    expect(seededQuizId).toBeTruthy();
    const res = await request(app).get(`/api/v1/quizzes/${seededQuizId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(seededQuizId);
    expect(res.body.data.questions.length).toBeGreaterThan(0);

    // Verify answers are shielded from client
    res.body.data.questions.forEach((q: any) => {
      expect(q.correctIndex).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('POST /api/v1/quizzes/generate synthesizes a new dynamic Vedic quiz on-the-fly', async () => {
    const res = await request(app).post('/api/v1/quizzes/generate').send({
      domain: 'chanakya',
      topic: 'Pragmatic Statecraft',
      difficulty: 'intermediate',
      questionCount: 3,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Dynamic Quiz');
    expect(res.body.data.domain).toBe('chanakya');
    expect(res.body.data.totalQuestions).toBeGreaterThanOrEqual(1);
    expect(res.body.data.isDynamic).toBe(true);
  });

  it('POST /api/v1/quizzes/attempt scores answers accurately and returns explanations with source references', async () => {
    const quizRes = await request(app).get(`/api/v1/quizzes/${seededQuizId}`);
    const questions = quizRes.body.data.questions;

    // Submit all 0 indices
    const answers = questions.map((_: any, idx: number) => ({
      questionIndex: idx,
      selectedIndex: 0,
    }));

    const attemptRes = await request(app)
      .post('/api/v1/quizzes/attempt')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        quizId: seededQuizId,
        answers,
        timeSpentSeconds: 65,
      });

    expect(attemptRes.status).toBe(200);
    expect(attemptRes.body.success).toBe(true);
    expect(attemptRes.body.data.totalQuestions).toBe(questions.length);
    expect(typeof attemptRes.body.data.score).toBe('number');
    expect(typeof attemptRes.body.data.percentage).toBe('number');
    expect(typeof attemptRes.body.data.passed).toBe('boolean');
    expect(attemptRes.body.data.answers.length).toBe(questions.length);

    // Verified explanations and source references are now unveiled after attempt
    expect(attemptRes.body.data.answers[0].explanation).toBeTruthy();
  });

  it('GET /api/v1/quizzes/attempts/me requires authentication and returns seeker history', async () => {
    const unauthRes = await request(app).get('/api/v1/quizzes/attempts/me');
    expect(unauthRes.status).toBe(401);

    const authRes = await request(app)
      .get('/api/v1/quizzes/attempts/me')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(Array.isArray(authRes.body.data)).toBe(true);
    expect(authRes.body.data.length).toBeGreaterThan(0);
    expect(authRes.body.data[0].userId).toBe(seekerId);
  });

  it('GET /api/v1/quizzes/stats/me returns user aggregate quiz performance stats', async () => {
    const res = await request(app)
      .get('/api/v1/quizzes/stats/me')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAttempts).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.averageScore).toBe('number');
    expect(typeof res.body.data.highestScore).toBe('number');
  });
});
