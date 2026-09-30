import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';

describe('API Foundation & Observability Integration Tests', () => {
  const config = loadApiConfig({
    NODE_ENV: 'test',
    PORT: 5999,
  });
  const logger = createLogger({ name: 'test-api', level: 'silent' });
  const app = createApp({ config, logger });

  it('GET /health confirms process is running (200 OK)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.version).toBe('1.0.0');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /ready verifies system dependencies', async () => {
    const res = await request(app).get('/ready');
    // Without active DB connection, readiness responds with degraded or 200/503
    expect([200, 503]).toContain(res.status);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.version).toBe('1.0.0');
  });

  it('GET /health/live and GET /health/ready also work', async () => {
    const liveRes = await request(app).get('/health/live');
    expect(liveRes.status).toBe(200);
    expect(liveRes.body.data.status).toBe('ok');

    const readyRes = await request(app).get('/health/ready');
    expect([200, 503]).toContain(readyRes.status);
  });

  it('Propagates existing X-Request-ID header from incoming requests', async () => {
    const customId = 'custom-correlation-id-999';
    const res = await request(app).get('/health').set('X-Request-ID', customId);

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('Returns 404 with structured error taxonomy for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.requestId).toBeDefined();
  });
});
