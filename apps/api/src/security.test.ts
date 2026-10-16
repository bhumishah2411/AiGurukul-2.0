import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { createApp } from './app.js';
import { createRateLimiter } from './middlewares/rate-limit.middleware.js';
import { sanitizeMiddleware } from './middlewares/sanitize.middleware.js';
import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';

const testLogger = createLogger({ name: 'test-security', level: 'silent' });

const testConfig = loadApiConfig({
  NODE_ENV: 'test',
  PORT: 5000,
  CORS_ORIGIN: 'http://localhost:3000',
  MONGODB_URI: 'mongodb://localhost:27017/aigurukul_test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'test_access_secret_long_enough_32_bytes_min',
  JWT_REFRESH_SECRET: 'test_refresh_secret_long_enough_32_bytes_min',
  COOKIE_SECRET: 'test_cookie_secret_long_enough_32_bytes_min',
});

describe('Phase 8: Security Hardening & Rate Limiting Test Suite', () => {
  describe('Security Headers (Helmet & Policies)', () => {
    const app = createApp({ config: testConfig, logger: testLogger });

    it('should include strict security headers on all responses', async () => {
      const res = await request(app).get('/health/live');

      expect(res.status).toBe(200);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['strict-transport-security']).toBeDefined();
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    });

    it('should provide strict CORS headers matching CORS_ORIGIN', async () => {
      const res = await request(app).get('/health/live').set('Origin', 'http://localhost:3000');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('NoSQL Injection & Sanitization Middleware', () => {
    it('should strip malicious MongoDB operator keys starting with $ or containing .', async () => {
      const testApp = express();
      testApp.use(express.json());
      testApp.use(sanitizeMiddleware);

      testApp.post('/test-sanitize', (req: Request, res: Response) => {
        res.json({ body: req.body, query: req.query });
      });

      const maliciousPayload = {
        username: 'seeker1',
        password: { $gt: '' }, // NoSQL operator injection
        $where: 'sleep(1000)',
        nested: {
          validField: 'allowed',
          $regex: '.*',
          'profile.role': 'admin',
        },
      };

      const res = await request(testApp)
        .post('/test-sanitize?token[$ne]=null&regular=valid')
        .send(maliciousPayload);

      expect(res.status).toBe(200);
      expect(res.body.body.username).toBe('seeker1');
      expect(res.body.body.password).toBeUndefined(); // $gt stripped
      expect(res.body.body.$where).toBeUndefined(); // $where stripped
      expect(res.body.body.nested.validField).toBe('allowed');
      expect(res.body.body.nested.$regex).toBeUndefined(); // $regex stripped
      expect(res.body.body.nested['profile.role']).toBeUndefined(); // dotted path stripped

      // Query param checks
      expect(res.body.query.token).toBeUndefined(); // token[$ne] stripped
      expect(res.body.query.regular).toBe('valid');
    });
  });

  describe('Sliding-Window Rate Limiter', () => {
    it('should allow requests under the limit and return 429 when threshold exceeded', async () => {
      const rateLimitApp = express();
      const limiter = createRateLimiter({
        windowMs: 5000,
        maxRequests: 3,
        keyPrefix: 'test-rl',
        message: 'Rate limit exceeded for test.',
      });

      rateLimitApp.use(limiter);
      rateLimitApp.get('/test-endpoint', (_req, res) => {
        res.json({ success: true, message: 'allowed' });
      });

      // Request 1: Allowed (Remaining = 2)
      const res1 = await request(rateLimitApp).get('/test-endpoint');
      expect(res1.status).toBe(200);
      expect(res1.headers['x-ratelimit-limit']).toBe('3');
      expect(res1.headers['x-ratelimit-remaining']).toBe('2');

      // Request 2: Allowed (Remaining = 1)
      const res2 = await request(rateLimitApp).get('/test-endpoint');
      expect(res2.status).toBe(200);
      expect(res2.headers['x-ratelimit-remaining']).toBe('1');

      // Request 3: Allowed (Remaining = 0)
      const res3 = await request(rateLimitApp).get('/test-endpoint');
      expect(res3.status).toBe(200);
      expect(res3.headers['x-ratelimit-remaining']).toBe('0');

      // Request 4: Blocked (429 Too Many Requests)
      const res4 = await request(rateLimitApp).get('/test-endpoint');
      expect(res4.status).toBe(429);
      expect(res4.headers['retry-after']).toBeDefined();
      expect(res4.body.success).toBe(false);
      expect(res4.body.error.code).toBe('TOO_MANY_REQUESTS');
      expect(res4.body.error.message).toBe('Rate limit exceeded for test.');
    });
  });

  describe('Observability & Standardized Error Handling', () => {
    const app = createApp({ config: testConfig, logger: testLogger });

    it('should assign a unique X-Request-ID header to every request', async () => {
      const res = await request(app).get('/health/live');
      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBeDefined();
      expect(typeof res.headers['x-request-id']).toBe('string');
      expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
    });

    it('should return a structured 404 JSON response for nonexistent endpoints', async () => {
      const res = await request(app).get('/api/v1/nonexistent-sanctum-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain('Endpoint not found');
    });
  });
});
