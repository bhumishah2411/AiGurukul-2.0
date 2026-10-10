import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import { UserModel, AyurvedaProfileModel } from '@ai-gurukul/database';
import { AYURVEDA_QUESTIONNAIRE } from './services/ayurveda-knowledge.js';

describe('Ayurveda Consultations & Dosha Recommendation Integration Tests (Phase 4A)', () => {
  const TEST_DB_URI =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aigurukul_ayurveda_test';

  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5996,
    MONGODB_URI: TEST_DB_URI,
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_32_characters_long!',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_32_characters_long!',
    COOKIE_SECRET: 'test_cookie_secret_32_characters_long!',
  });

  const logger = createLogger({ name: 'test-ayurveda-api', level: 'silent' });
  let app: ReturnType<typeof createApp>;
  let seekerAccessToken = '';
  let seekerId = '';

  const seekerUser = {
    email: 'charaka.seeker@vedictest.com',
    password: 'SacredPassword123!',
    displayName: 'Charaka Seeker',
    preferredPersona: 'vaidya' as const,
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    await UserModel.deleteMany({ email: seekerUser.email });
    await AyurvedaProfileModel.deleteMany({});

    app = createApp({ config, logger });

    // Register seeker to obtain valid JWT token
    const regRes = await request(app).post('/api/v1/auth/register').send(seekerUser);
    expect(regRes.status).toBe(201);
    seekerAccessToken = regRes.body.data.tokens.accessToken;
    seekerId = regRes.body.data.user.id;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: seekerUser.email });
    await AyurvedaProfileModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/ayurveda/questionnaire returns 18 questions and available symptom catalog', async () => {
    const res = await request(app).get('/api/v1/ayurveda/questionnaire');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalQuestions).toBe(18);
    expect(res.body.data.questions).toHaveLength(18);
    expect(res.body.data.availableSymptoms.length).toBeGreaterThan(10);
  });

  it('POST /api/v1/ayurveda/prakriti rejects unauthenticated requests with 401', async () => {
    const res = await request(app).post('/api/v1/ayurveda/prakriti').send({ answers: [] });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/ayurveda/prakriti rejects questionnaire submissions with fewer than 12 answers', async () => {
    const fewAnswers = Array.from({ length: 5 }, (_, i) => ({
      questionId: `q_${i}`,
      selectedOptionId: `opt_${i}`,
    }));

    const res = await request(app)
      .post('/api/v1/ayurveda/prakriti')
      .set('Authorization', `Bearer ${seekerAccessToken}`)
      .send({ answers: fewAnswers });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/ayurveda/prakriti computes constitution and saves profile in MongoDB', async () => {
    // Generate answers favoring Pitta
    const pittaAnswers = AYURVEDA_QUESTIONNAIRE.map((q, idx) => ({
      questionId: q.id,
      selectedOptionId:
        idx < 12
          ? q.options.find((opt) => opt.dosha === 'pitta')!.id
          : q.options.find((opt) => opt.dosha === 'vata')!.id,
    }));

    const res = await request(app)
      .post('/api/v1/ayurveda/prakriti')
      .set('Authorization', `Bearer ${seekerAccessToken}`)
      .send({ answers: pittaAnswers });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prakriti.pitta).toBeGreaterThan(res.body.data.prakriti.vata);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);

    // Verify in MongoDB
    const savedDoc = await AyurvedaProfileModel.findOne({ userId: seekerId });
    expect(savedDoc).toBeDefined();
    expect(savedDoc?.prakriti.dominantDosha).toBe('pitta');
  });

  it('GET /api/v1/ayurveda/profile returns saved seeker constitution and prescriptions', async () => {
    const res = await request(app)
      .get('/api/v1/ayurveda/profile')
      .set('Authorization', `Bearer ${seekerAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(seekerId);
    expect(res.body.data.prakriti.dominantDosha).toBe('pitta');
  });

  it('POST /api/v1/ayurveda/symptoms logs acute symptoms and updates current imbalances', async () => {
    const res = await request(app)
      .post('/api/v1/ayurveda/symptoms')
      .set('Authorization', `Bearer ${seekerAccessToken}`)
      .send({
        symptoms: ['hyperacidity', 'skin_rashes', 'irritability'],
        notes: 'Excessive spicy food during summer.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currentImbalances).toContain('pitta');
    expect(res.body.data.recentVikritiLogs).toHaveLength(1);
    expect(res.body.data.recentVikritiLogs[0].symptoms).toContain('hyperacidity');
  });

  it('GET /api/v1/ayurveda/recommendations returns filtered prescriptions by category', async () => {
    const res = await request(app)
      .get('/api/v1/ayurveda/recommendations?category=diet')
      .set('Authorization', `Bearer ${seekerAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dominantDosha).toBe('pitta');
    expect(res.body.data.recommendations.every((r: any) => r.category === 'diet')).toBe(true);
  });
});
