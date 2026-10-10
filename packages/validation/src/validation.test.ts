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
  SubmitPrakritiAnswersSchema,
  LogSymptomsSchema,
  NodeSlugParamSchema,
  GraphPathQuerySchema,
  GraphSearchQuerySchema,
  DocumentUploadSchema,
  DocumentListQuerySchema,
  RAGQuerySchema,
} from './index.js';

describe('Validation Package Unit Tests (Phase 2 - Phase 5A)', () => {
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

  it('validates SubmitPrakritiAnswersSchema requires minimum 12 answers', () => {
    const validAnswers = Array.from({ length: 15 }, (_, i) => ({
      questionId: `q_${i + 1}`,
      selectedOptionId: `opt_v_${i + 1}`,
    }));

    const result = SubmitPrakritiAnswersSchema.safeParse({ answers: validAnswers });
    expect(result.success).toBe(true);

    const tooFew = Array.from({ length: 5 }, (_, i) => ({
      questionId: `q_${i + 1}`,
      selectedOptionId: `opt_v_${i + 1}`,
    }));
    const invalidResult = SubmitPrakritiAnswersSchema.safeParse({ answers: tooFew });
    expect(invalidResult.success).toBe(false);
  });

  it('validates LogSymptomsSchema requires non-empty symptom array', () => {
    const valid = {
      symptoms: ['insomnia', 'dry_skin', 'restlessness'],
      notes: 'Experiencing elevated stress during autumn',
    };
    const result = LogSymptomsSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const empty = { symptoms: [] };
    expect(LogSymptomsSchema.safeParse(empty).success).toBe(false);
  });

  it('validates NodeSlugParamSchema format and rejects invalid characters', () => {
    expect(NodeSlugParamSchema.safeParse({ slug: 'advaita-vedanta' }).success).toBe(true);
    expect(NodeSlugParamSchema.safeParse({ slug: 'dharma' }).success).toBe(true);
    expect(NodeSlugParamSchema.safeParse({ slug: 'Invalid Slug!' }).success).toBe(false);
    expect(NodeSlugParamSchema.safeParse({ slug: '' }).success).toBe(false);
  });

  it('validates GraphPathQuerySchema parameters and limits', () => {
    const valid = { source: 'samkhya', target: 'ayurveda', maxDepth: '4' };
    const result = GraphPathQuerySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxDepth).toBe(4);
    }

    const invalid = { source: '', target: 'ayurveda' };
    expect(GraphPathQuerySchema.safeParse(invalid).success).toBe(false);
  });

  it('validates GraphSearchQuerySchema filters and limits', () => {
    const valid = { q: 'Karma', type: 'concept', limit: '30' };
    const result = GraphSearchQuerySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(30);
      expect(result.data.type).toBe('concept');
    }
  });

  it('validates DocumentUploadSchema requirements', () => {
    const valid = {
      title: 'Bhagavad Gita Chapter 2 Analysis',
      domain: 'gita',
      content: 'Karmanye vadadhikaraste ma phaleshu kadachana...',
      author: 'Vyasa',
      language: 'sa',
    };
    const result = DocumentUploadSchema.safeParse(valid);
    expect(result.success).toBe(true);

    const invalid = { title: 'A', domain: '', content: 'short' };
    expect(DocumentUploadSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates DocumentListQuerySchema defaults and coercion', () => {
    const valid = { page: '3', limit: '50', domain: 'ayurveda', status: 'indexed' };
    const result = DocumentListQuerySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
      expect(result.data.domain).toBe('ayurveda');
      expect(result.data.status).toBe('indexed');
    }
  });

  it('validates RAGQuerySchema constraints', () => {
    const valid = {
      query: 'What is the true nature of Nishkama Karma?',
      topK: '5',
      minScore: '0.2',
    };
    const result = RAGQuerySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topK).toBe(5);
      expect(result.data.minScore).toBe(0.2);
    }

    const tooShort = { query: 'no' };
    expect(RAGQuerySchema.safeParse(tooShort).success).toBe(false);
  });
});
