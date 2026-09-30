import { describe, it, expect } from 'vitest';
import { loadApiConfig, loadWorkerConfig, ApiEnvSchema } from './env.js';

describe('Config Package Unit Tests', () => {
  it('loads valid default API configuration in development mode', () => {
    const config = loadApiConfig({ NODE_ENV: 'test' });
    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(5000);
    expect(config.AI_PROVIDER).toBe('local');
    expect(config.EMBEDDING_PROVIDER).toBe('local');
    expect(config.VECTOR_STORE_PROVIDER).toBe('local');
    expect(config.STORAGE_PROVIDER).toBe('local');
  });

  it('loads valid default Worker configuration', () => {
    const config = loadWorkerConfig({ NODE_ENV: 'test' });
    expect(config.WORKER_CONCURRENCY).toBe(3);
    expect(config.REDIS_URL).toBeDefined();
    expect(config.MONGODB_URI).toBeDefined();
  });

  it('rejects invalid environment values', () => {
    const result = ApiEnvSchema.safeParse({
      NODE_ENV: 'invalid_env_name',
    });
    expect(result.success).toBe(false);
  });
});
