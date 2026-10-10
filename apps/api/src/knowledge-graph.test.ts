import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import {
  KnowledgeNodeModel,
  KnowledgeEdgeModel,
  seedCanonicalKnowledgeGraph,
} from '@ai-gurukul/database';

describe('Vedic Knowledge Graph Integration Tests (Phase 4B)', () => {
  const TEST_DB_URI =
    process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/aigurukul_graph_test';

  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5995,
    MONGODB_URI: TEST_DB_URI,
    JWT_ACCESS_SECRET: 'test_jwt_access_secret_32_characters_long!',
    JWT_REFRESH_SECRET: 'test_jwt_refresh_secret_32_characters_long!',
    COOKIE_SECRET: 'test_cookie_secret_32_characters_long!',
  });

  const logger = createLogger({ name: 'test-graph-api', level: 'silent' });
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    await KnowledgeNodeModel.deleteMany({});
    await KnowledgeEdgeModel.deleteMany({});

    // Seed test graph
    await seedCanonicalKnowledgeGraph(KnowledgeNodeModel, KnowledgeEdgeModel);

    app = createApp({ config, logger });
  });

  afterAll(async () => {
    await KnowledgeNodeModel.deleteMany({});
    await KnowledgeEdgeModel.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('GET /api/v1/graph/overview returns complete knowledge graph and statistics', async () => {
    const res = await request(app).get('/api/v1/graph/overview');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('nodes');
    expect(res.body.data).toHaveProperty('edges');
    expect(res.body.data).toHaveProperty('statistics');

    const { nodes, edges, statistics } = res.body.data;
    expect(nodes.length).toBeGreaterThanOrEqual(20);
    expect(edges.length).toBeGreaterThanOrEqual(25);
    expect(statistics.totalNodes).toBe(nodes.length);
    expect(statistics.totalEdges).toBe(edges.length);
    expect(statistics.entityTypeCounts).toHaveProperty('concept');
    expect(statistics.entityTypeCounts).toHaveProperty('tradition');
  });

  it('GET /api/v1/graph/overview?type=concept filters nodes by entityType', async () => {
    const res = await request(app).get('/api/v1/graph/overview?type=concept');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { nodes } = res.body.data;
    expect(nodes.length).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.entityType).toBe('concept');
    }
  });

  it('GET /api/v1/graph/nodes/:slug returns comprehensive node detail and neighborhood', async () => {
    const res = await request(app).get('/api/v1/graph/nodes/dharma');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { node, outgoingEdges, incomingEdges, neighborNodes } = res.body.data;
    expect(node.slug).toBe('dharma');
    expect(node.name).toBe('Dharma');
    expect(node.sanskritName).toBe('धर्म');
    expect(Array.isArray(outgoingEdges)).toBe(true);
    expect(Array.isArray(incomingEdges)).toBe(true);
    expect(Array.isArray(neighborNodes)).toBe(true);
    expect(neighborNodes.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/graph/nodes/nonexistent returns 404 NotFoundError', async () => {
    const res = await request(app).get('/api/v1/graph/nodes/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/graph/nodes/INVALID_UPPERCASE returns 422 ValidationError', async () => {
    const res = await request(app).get('/api/v1/graph/nodes/INVALID_UPPERCASE');
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/graph/search queries nodes across names, tags, and summaries', async () => {
    const res = await request(app).get('/api/v1/graph/search?q=Karma');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nodes.length).toBeGreaterThan(0);

    const slugs = res.body.data.nodes.map((n: { slug: string }) => n.slug);
    expect(slugs).toContain('karma');
  });

  it('GET /api/v1/graph/search with type filter returns strictly matching entities', async () => {
    const res = await request(app).get('/api/v1/graph/search?type=text');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const slugs = res.body.data.nodes.map((n: { slug: string }) => n.slug);
    expect(slugs).toContain('bhagavad-gita');
  });

  it('GET /api/v1/graph/path calculates multi-hop semantic connection between concepts', async () => {
    const res = await request(app).get('/api/v1/graph/path?source=samkhya&target=ayurveda');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { found, source, target, length, nodePath, edgePath } = res.body.data;
    expect(found).toBe(true);
    expect(source).toBe('samkhya');
    expect(target).toBe('ayurveda');
    expect(length).toBeGreaterThanOrEqual(1);
    expect(nodePath[0].slug).toBe('samkhya');
    expect(nodePath[nodePath.length - 1].slug).toBe('ayurveda');
    expect(edgePath.length).toBe(length);
  });

  it('GET /api/v1/graph/path returns 400 when source equals target', async () => {
    const res = await request(app).get('/api/v1/graph/path?source=dharma&target=dharma');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
