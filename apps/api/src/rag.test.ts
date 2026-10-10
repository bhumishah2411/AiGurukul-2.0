import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import { DocumentModel, DocumentChunkModel, seedCanonicalDocuments } from '@ai-gurukul/database';

describe('RAG Infrastructure & Document Ingestion Tests (Phase 5A)', () => {
  const TEST_DB_URI =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aigurukul_rag_test';

  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5996,
    MONGODB_URI: TEST_DB_URI,
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_32_characters_long!',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_32_characters_long!',
    COOKIE_SECRET: 'test_cookie_secret_32_characters_long!',
  });

  const logger = createLogger({ name: 'test-rag-api', level: 'silent' });
  let app: ReturnType<typeof createApp>;
  let createdDocId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    await DocumentModel.deleteMany({});
    await DocumentChunkModel.deleteMany({});

    // Seed canonical documents
    await seedCanonicalDocuments();

    app = createApp({ config, logger });
  });

  afterAll(async () => {
    await DocumentModel.deleteMany({});
    await DocumentChunkModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/rag/stats returns corpus statistics and domain counts', async () => {
    const res = await request(app).get('/api/v1/rag/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDocuments).toBeGreaterThanOrEqual(4);
    expect(res.body.data.indexedDocuments).toBeGreaterThanOrEqual(4);
    expect(res.body.data.totalChunks).toBeGreaterThanOrEqual(10);
    expect(res.body.data.totalTokens).toBeGreaterThan(0);
    expect(res.body.data.domainCounts).toHaveProperty('gita');
    expect(res.body.data.domainCounts).toHaveProperty('chanakya');
  });

  it('GET /api/v1/documents returns paginated list of ingested documents', async () => {
    const res = await request(app).get('/api/v1/documents?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.documents.length).toBeGreaterThanOrEqual(4);
    expect(res.body.data.total).toBeGreaterThanOrEqual(4);
    expect(res.body.data.page).toBe(1);
  });

  it('GET /api/v1/documents filters documents by domain', async () => {
    const res = await request(app).get('/api/v1/documents?domain=gita');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.documents.length).toBeGreaterThanOrEqual(1);
    for (const doc of res.body.data.documents) {
      expect(doc.domain).toBe('gita');
    }
  });

  it('POST /api/v1/documents uploads and indexes new document', async () => {
    const payload = {
      title: 'Upanishadic Discourse on Brahman and Maya',
      domain: 'vedanta',
      author: 'Adi Shankara',
      era: 'c. 8th Century CE',
      language: 'sa',
      content:
        'ब्रह्म सत्यं जगन्मिथ्या जीवो ब्रह्मैव नापरः। [Vivekachudamani 108] Brahman is the absolute transcendent reality; the empirical universe is transient and illusory appearance (Maya). The embodied individual soul is fundamentally none other than supreme Brahman.\n\nज्ञानेन तु तदज्ञानं येषां नाशितमात्मनः। [BG 5.16] But for those whose ignorance is destroyed by spiritual knowledge of the Self, that knowledge illuminates the Supreme.',
    };

    const res = await request(app).post('/api/v1/documents').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(payload.title);
    expect(res.body.data.status).toBe('indexed');
    expect(res.body.data.chunkCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.tokenCount).toBeGreaterThan(0);

    createdDocId = res.body.data.id;
  });

  it('POST /api/v1/documents rejects invalid payloads', async () => {
    const invalid = { title: 'A', domain: '', content: 'short' };
    const res = await request(app).post('/api/v1/documents').send(invalid);
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/documents/:id returns document details and its chunks', async () => {
    const res = await request(app).get(`/api/v1/documents/${createdDocId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.document.id).toBe(createdDocId);
    expect(res.body.data.chunks.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.chunks[0]).toHaveProperty('text');
    expect(res.body.data.chunks[0]).toHaveProperty('canonicalReference');
  });

  it('GET /api/v1/documents/:id returns 404 for non-existent document', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/v1/documents/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/rag/query performs semantic retrieval with citations', async () => {
    const res = await request(app).post('/api/v1/rag/query').send({
      query: 'What does the Gita teach about duty and attachment to fruits of action?',
      topK: 3,
      minScore: 0.01,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.query).toBe(
      'What does the Gita teach about duty and attachment to fruits of action?'
    );
    expect(res.body.data).toHaveProperty('citations');
    expect(res.body.data).toHaveProperty('synthesizedContext');
    expect(res.body.data.synthesizedContext).toContain('Grounded Vedic Source Context');
  });

  it('POST /api/v1/rag/query rejects queries shorter than 3 characters', async () => {
    const res = await request(app).post('/api/v1/rag/query').send({ query: 'hi' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/v1/documents/:id removes document and associated chunks', async () => {
    const res = await request(app).delete(`/api/v1/documents/${createdDocId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify document no longer exists
    const checkRes = await request(app).get(`/api/v1/documents/${createdDocId}`);
    expect(checkRes.status).toBe(404);

    // Verify chunks are deleted
    const chunks = await DocumentChunkModel.find({
      documentId: new mongoose.Types.ObjectId(createdDocId),
    });
    expect(chunks.length).toBe(0);
  });
});
