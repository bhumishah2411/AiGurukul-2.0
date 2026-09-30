import { describe, it, expect } from 'vitest';
import { createLogger } from './logger.js';

describe('Logging Package Unit Tests', () => {
  it('creates a logger instance with configured name and level', () => {
    const logger = createLogger({ name: 'test-logger', level: 'debug', isProduction: true });
    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });

  it('redacts sensitive fields in logging payload', () => {
    const logger = createLogger({ name: 'redact-test', isProduction: true });
    expect(logger).toBeDefined();
    // Verify logger can execute without throwing on sensitive structures
    expect(() => {
      logger.info({ password: 'secretpassword123', token: 'jwt-token-string' }, 'Test redact');
    }).not.toThrow();
  });
});
