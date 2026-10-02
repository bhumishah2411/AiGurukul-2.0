import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import {
  UserModel,
  SessionModel,
  ConversationModel,
  MessageModel,
  WisdomVerseModel,
} from '@ai-gurukul/database';

describe('Wisdom Guidance & SSE Streaming Integration Tests (Phase 3)', () => {
  const TEST_DB_URI =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aigurukul_wisdom_test';

  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5997,
    MONGODB_URI: TEST_DB_URI,
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_32_characters_long!',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_32_characters_long!',
    COOKIE_SECRET: 'test_cookie_secret_32_characters_long!',
  });

  const logger = createLogger({ name: 'test-wisdom-api', level: 'silent' });
  let app: ReturnType<typeof createApp>;

  let seekerToken = '';
  let seekerId = '';
  let activeConversationId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    // Clean test collections
    await UserModel.deleteMany({ email: 'arjuna.wisdom@vedictest.com' });
    await ConversationModel.deleteMany({});
    await MessageModel.deleteMany({});
    await WisdomVerseModel.deleteMany({});

    app = createApp({ config, logger });

    // Register a seeker to test authenticated endpoints
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: 'arjuna.wisdom@vedictest.com',
      password: 'SacredPassword123!',
      displayName: 'Partha Arjuna',
      preferredPersona: 'krishna',
    });

    seekerToken = regRes.body.data.tokens.accessToken;
    seekerId = regRes.body.data.user.id;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: 'arjuna.wisdom@vedictest.com' });
    await ConversationModel.deleteMany({});
    await MessageModel.deleteMany({});
    await WisdomVerseModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/wisdom/personas returns list of all 5 authentic Vedic personas', async () => {
    const res = await request(app).get('/api/v1/wisdom/personas');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.personas).toHaveLength(5);

    const personaIds = res.body.data.personas.map((p: any) => p.id);
    expect(personaIds).toContain('krishna');
    expect(personaIds).toContain('chanakya');
    expect(personaIds).toContain('vaidya');
    expect(personaIds).toContain('vyasa');
    expect(personaIds).toContain('patanjali');

    const krishna = res.body.data.personas.find((p: any) => p.id === 'krishna');
    expect(krishna.color).toBe('#7B68EE');
    expect(krishna.philosophicalCore).toBeDefined();
    expect(krishna.sampleInquiries.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/wisdom/verses returns canonical seed verses with translations and commentaries', async () => {
    const res = await request(app).get('/api/v1/wisdom/verses');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(5);

    const refs = res.body.data.items.map((v: any) => v.canonicalReference);
    expect(refs).toContain('BG 2.47');
    expect(refs).toContain('Arthashastra 1.7.1');
    expect(refs).toContain('Charaka Samhita Sutrasthana 1.41');
  });

  it('GET /api/v1/wisdom/verses supports filtering by domain and keyword search', async () => {
    const gitaRes = await request(app).get('/api/v1/wisdom/verses?domain=gita');
    expect(gitaRes.status).toBe(200);
    expect(gitaRes.body.data.items.every((v: any) => v.domain === 'gita')).toBe(true);

    const searchRes = await request(app).get('/api/v1/wisdom/verses?search=Nishkama');
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.items.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/wisdom/conversations requires authentication (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/v1/wisdom/conversations')
      .send({ persona: 'krishna' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/wisdom/conversations starts a new conversation thread for seeker', async () => {
    const res = await request(app)
      .post('/api/v1/wisdom/conversations')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        persona: 'krishna',
        title: 'Guidance on Svadharma and Anxiety',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.persona).toBe('krishna');
    expect(res.body.data.title).toBe('Guidance on Svadharma and Anxiety');
    expect(res.body.data.status).toBe('active');
    expect(res.body.data.userId).toBe(seekerId);

    activeConversationId = res.body.data.id;
  });

  it('POST /api/v1/wisdom/conversations supports initial message exchange upon creation', async () => {
    const res = await request(app)
      .post('/api/v1/wisdom/conversations')
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        persona: 'chanakya',
        initialMessage: 'How should a leader evaluate untrustworthy advisers?',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.persona).toBe('chanakya');
    expect(res.body.data.messages).toHaveLength(2); // User query + Assistant response
    expect(res.body.data.messages[0].sender).toBe('user');
    expect(res.body.data.messages[1].sender).toBe('assistant');
    expect(res.body.data.messages[1].citations).toBeDefined();
  });

  it('GET /api/v1/wisdom/conversations lists paginated conversations for seeker', async () => {
    const res = await request(app)
      .get('/api/v1/wisdom/conversations')
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.total).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/v1/wisdom/conversations/:id returns conversation details and message history', async () => {
    const res = await request(app)
      .get(`/api/v1/wisdom/conversations/${activeConversationId}`)
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(activeConversationId);
    expect(Array.isArray(res.body.data.messages)).toBe(true);
  });

  it('POST /api/v1/wisdom/conversations/:id/messages sends synchronous message with citations', async () => {
    const res = await request(app)
      .post(`/api/v1/wisdom/conversations/${activeConversationId}/messages`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        content: 'O Krishna, how do I overcome grief and attachment?',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message.sender).toBe('assistant');
    expect(res.body.data.message.content).toContain('BG 2.47');
    expect(res.body.data.message.citations).toBeDefined();
    expect(res.body.data.message.citations.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/wisdom/conversations/:id/stream streams response via Server-Sent Events (SSE)', async () => {
    const res = await request(app)
      .post(`/api/v1/wisdom/conversations/${activeConversationId}/stream`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .send({
        content: 'Tell me about the discipline of the mind.',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');

    const streamBody = res.text;
    expect(streamBody).toContain('event: token');
    expect(streamBody).toContain('event: done');
    expect(streamBody).toContain('conversationId');

    // Confirm that the message was saved in database
    const convDetails = await request(app)
      .get(`/api/v1/wisdom/conversations/${activeConversationId}`)
      .set('Authorization', `Bearer ${seekerToken}`);

    const lastMsg = convDetails.body.data.messages.slice(-1)[0];
    expect(lastMsg.sender).toBe('assistant');
    expect(lastMsg.citations).toBeDefined();
  });

  it('DELETE /api/v1/wisdom/conversations/:id archives conversation', async () => {
    const res = await request(app)
      .delete(`/api/v1/wisdom/conversations/${activeConversationId}`)
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get(`/api/v1/wisdom/conversations/${activeConversationId}`)
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(checkRes.body.data.status).toBe('archived');
  });

  it('Returns 404 when querying unknown conversation', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/v1/wisdom/conversations/${nonExistentId}`)
      .set('Authorization', `Bearer ${seekerToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
