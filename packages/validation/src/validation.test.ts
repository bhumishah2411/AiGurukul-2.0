import { describe, it, expect } from 'vitest';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  WisdomQuerySchema,
  PaginationQuerySchema,
} from './index.js';

describe('Validation Package Unit Tests', () => {
  it('validates correct registration payload', () => {
    const valid = {
      email: 'Arjuna@Kurukshetra.org',
      password: 'ParthaSecurePassword123!',
      displayName: 'Arjuna Pandava',
      preferredPersona: 'krishna',
    };
    const result = RegisterRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('arjuna@kurukshetra.org'); // Lowercased
    }
  });

  it('rejects invalid email and short password', () => {
    const invalid = {
      email: 'not-an-email',
      password: 'short',
      displayName: 'A',
    };
    const result = RegisterRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates pagination defaults', () => {
    const parsed = PaginationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it('validates wisdom query schema', () => {
    const query = {
      query: 'What is Nishkama Karma?',
      persona: 'krishna',
    };
    const result = WisdomQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
  });
});
