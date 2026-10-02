import { describe, it, expect } from 'vitest';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  GoogleAuthRequestSchema,
  RefreshTokenRequestSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
  WisdomQuerySchema,
  PaginationQuerySchema,
  CreateConversationSchema,
  SendMessageSchema,
  ConversationQuerySchema,
} from './index.js';

describe('Validation Package Unit Tests (Phase 2 & Phase 3)', () => {
  it('validates correct registration payload', () => {
    const valid = {
      email: 'Arjuna@Kurukshetra.org',
      password: 'ParthaSecurePassword123!',
      displayName: 'Arjuna Pandava',
      preferredPersona: 'krishna',
      language: 'sa',
    };
    const result = RegisterRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('arjuna@kurukshetra.org'); // Lowercased
      expect(result.data.preferredPersona).toBe('krishna');
      expect(result.data.language).toBe('sa');
    }
  });

  it('rejects invalid email and short password in registration', () => {
    const invalid = {
      email: 'not-an-email',
      password: 'short',
      displayName: 'A',
    };
    const result = RegisterRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates login request payload', () => {
    const valid = {
      email: 'Seeker@Vedic.edu',
      password: 'SecretPassword123!',
    };
    const result = LoginRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('seeker@vedic.edu');
    }
  });

  it('validates Google auth request payload', () => {
    const valid = { idToken: 'valid-google-id-token-abc' };
    const invalid = { idToken: '' };

    expect(GoogleAuthRequestSchema.safeParse(valid).success).toBe(true);
    expect(GoogleAuthRequestSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates update profile payload', () => {
    const valid = {
      displayName: 'Chanakya Pandit',
      preferences: {
        defaultPersona: 'chanakya',
        language: 'hi',
        notificationsEnabled: false,
      },
    };
    const result = UpdateProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('validates change password payload', () => {
    const valid = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewSacredPassword456!',
    };
    expect(ChangePasswordSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      currentPassword: '',
      newPassword: 'short',
    };
    expect(ChangePasswordSchema.safeParse(invalid).success).toBe(false);
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

  it('validates CreateConversationSchema defaults and bounds', () => {
    const valid = {
      persona: 'chanakya',
      title: 'Statecraft Consultation',
      initialMessage: 'How do I maintain discipline?',
    };
    const result = CreateConversationSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const defaultCheck = CreateConversationSchema.safeParse({});
    expect(defaultCheck.success).toBe(true);
    if (defaultCheck.success) {
      expect(defaultCheck.data.persona).toBe('krishna');
    }
  });

  it('validates SendMessageSchema requirements', () => {
    const valid = { content: 'Explain BG 2.47 in detail.' };
    const result = SendMessageSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const empty = { content: '' };
    expect(SendMessageSchema.safeParse(empty).success).toBe(false);
  });

  it('validates ConversationQuerySchema pagination & filters', () => {
    const valid = { page: '2', limit: '15', persona: 'vaidya' };
    const result = ConversationQuerySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(15);
      expect(result.data.persona).toBe('vaidya');
    }
  });
});
