import { describe, it, expect, vi } from 'vitest';
import { DatabaseService } from './connection.js';
import { MigrationRunner, MigrationScript, MigrationModel } from './migration.js';
import {
  UserModel,
  SessionModel,
  ConversationModel,
  MessageModel,
  WisdomVerseModel,
  AyurvedaProfileModel,
  KnowledgeNodeModel,
  KnowledgeEdgeModel,
} from './models/index.js';
import { createLogger } from '@ai-gurukul/logging';
import mongoose, { Types } from 'mongoose';

describe('Database Package Unit Tests (Phase 2 & Phase 3)', () => {
  const logger = createLogger({ name: 'test-db', level: 'silent' });

  it('initializes DatabaseService singleton with options', () => {
    const service = DatabaseService.getInstance({
      uri: 'mongodb://localhost:27017/test_db',
      logger,
    });
    expect(service).toBeDefined();
    expect(DatabaseService.getInstance()).toBe(service);
  });

  it('returns connection readyState', () => {
    const service = DatabaseService.getInstance();
    expect(typeof service.readyState).toBe('number');
  });

  it('ping returns health status structure without throwing', async () => {
    const service = DatabaseService.getInstance();
    const result = await service.ping();
    expect(result).toHaveProperty('healthy');
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('MigrationRunner computes status report accurately', async () => {
    const findSpy = vi.spyOn(MigrationModel, 'find').mockReturnValue({
      sort: () => ({
        lean: () => ({
          exec: async () => [{ id: '001_init.ts', batch: 1, appliedAt: new Date() }],
        }),
      }),
    } as any);

    const runner = new MigrationRunner(mongoose.connection, logger);
    const testMigrations: MigrationScript[] = [
      { id: '001_init.ts', up: async () => {}, down: async () => {} },
      { id: '002_add_indexes.ts', up: async () => {}, down: async () => {} },
    ];

    const status = await runner.getStatus(testMigrations);
    expect(status.appliedCount).toBe(1);
    expect(status.pendingCount).toBe(1);
    expect(status.pending).toContain('002_add_indexes.ts');

    findSpy.mockRestore();
  });

  it('UserModel instantiates with schema validation & toDTO transform', () => {
    const userDoc = new UserModel({
      email: 'Chanakya@Neeti.org',
      displayName: 'Vishnugupta Chanakya',
      role: 'scholar',
      preferences: {
        defaultPersona: 'chanakya',
        language: 'sa',
        notificationsEnabled: true,
      },
    });

    expect(userDoc.email).toBe('chanakya@neeti.org'); // Lowercased
    expect(userDoc.role).toBe('scholar');

    const dto = userDoc.toDTO();
    expect(dto.email).toBe('chanakya@neeti.org');
    expect(dto.displayName).toBe('Vishnugupta Chanakya');
    expect(dto.role).toBe('scholar');
    expect(dto.preferences.defaultPersona).toBe('chanakya');
    expect(dto).not.toHaveProperty('passwordHash');
  });

  it('SessionModel instantiates with TTL index and toDTO transform', () => {
    const userId = new Types.ObjectId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const sessionDoc = new SessionModel({
      userId,
      refreshTokenHash: 'sha256_mock_hash_1234567890abcdef',
      userAgent: 'Mozilla/5.0 Test Agent',
      ipAddress: '127.0.0.1',
      isValid: true,
      expiresAt,
    });

    expect(sessionDoc.isValid).toBe(true);
    expect(sessionDoc.refreshTokenHash).toBe('sha256_mock_hash_1234567890abcdef');

    const dto = sessionDoc.toDTO();
    expect(dto.userId).toBe(userId.toString());
    expect(dto.isValid).toBe(true);
    expect(dto.ipAddress).toBe('127.0.0.1');
    expect(dto.expiresAt).toBe(expiresAt.toISOString());
  });

  it('ConversationModel instantiates with persona, timestamps and toDTO transform', () => {
    const userId = new Types.ObjectId();
    const convDoc = new ConversationModel({
      userId,
      persona: 'krishna',
      title: 'Overcoming Grief & Attachment',
      status: 'active',
      lastMessageAt: new Date(),
      messageCount: 2,
    });

    expect(convDoc.persona).toBe('krishna');
    expect(convDoc.title).toBe('Overcoming Grief & Attachment');
    expect(convDoc.status).toBe('active');

    const dto = convDoc.toDTO();
    expect(dto.userId).toBe(userId.toString());
    expect(dto.persona).toBe('krishna');
    expect(dto.title).toBe('Overcoming Grief & Attachment');
    expect(dto.messageCount).toBe(2);
  });

  it('MessageModel instantiates with citations and toDTO transform', () => {
    const convId = new Types.ObjectId();
    const msgDoc = new MessageModel({
      conversationId: convId,
      sender: 'assistant',
      content: 'Remember the eternal self as taught in BG 2.47.',
      citations: [
        {
          canonicalReference: 'BG 2.47',
          chunkText: 'Your right is to work only, never to its fruits.',
          domain: 'gita',
          chapter: 2,
          verse: 47,
          relevanceScore: 0.98,
        },
      ],
      tokenUsage: {
        promptTokens: 12,
        completionTokens: 25,
        totalTokens: 37,
      },
    });

    expect(msgDoc.sender).toBe('assistant');
    expect(msgDoc.citations).toHaveLength(1);

    const dto = msgDoc.toDTO();
    expect(dto.conversationId).toBe(convId.toString());
    expect(dto.sender).toBe('assistant');
    expect(dto.citations).toHaveLength(1);
    expect(dto.citations![0].canonicalReference).toBe('BG 2.47');
    expect(dto.tokenUsage?.totalTokens).toBe(37);
  });

  it('WisdomVerseModel instantiates with canonical reference and toDTO transform', () => {
    const verseDoc = new WisdomVerseModel({
      domain: 'gita',
      canonicalReference: 'BG 2.47',
      sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
      transliteration: 'karmaṇy-evādhikāras te mā phaleṣu kadācana',
      englishTranslation: 'You have a right to perform your duties, but never to the fruits.',
      themes: ['duty', 'action', 'karma-yoga'],
      speaker: 'Lord Krishna',
    });

    expect(verseDoc.canonicalReference).toBe('BG 2.47');
    const dto = verseDoc.toDTO();
    expect(dto.domain).toBe('gita');
    expect(dto.canonicalReference).toBe('BG 2.47');
    expect(dto.themes).toContain('karma-yoga');
    expect(dto.speaker).toBe('Lord Krishna');
  });

  it('AyurvedaProfileModel instantiates with prakriti scores, recommendations and toDTO transform', () => {
    const userId = new Types.ObjectId();
    const profileDoc = new AyurvedaProfileModel({
      userId,
      prakriti: {
        vata: 45,
        pitta: 35,
        kapha: 20,
        dominantDosha: 'vata-pitta',
        secondaryDosha: 'pitta',
      },
      currentImbalances: ['vata'],
      recommendations: [
        {
          id: 'rec_vata_oil',
          category: 'routine',
          title: 'Warm Sesame Oil Abhyanga',
          guidance: 'Perform self-massage with warm sesame oil before morning bath.',
          classicalReference: 'Charaka Samhita Sutrasthana 5.88',
          benefits: ['Grounds excess Vata', 'Nourishes nervous system'],
        },
      ],
      vikritiLogs: [
        {
          date: new Date(),
          symptoms: ['insomnia', 'dry_skin'],
          elevatedDoshas: ['vata'],
          notes: 'High workload and travel.',
        },
      ],
    });

    expect(profileDoc.prakriti.dominantDosha).toBe('vata-pitta');
    expect(profileDoc.currentImbalances).toContain('vata');

    const dto = profileDoc.toDTO();
    expect(dto.userId).toBe(userId.toString());
    expect(dto.prakriti.vata).toBe(45);
    expect(dto.prakriti.dominantDosha).toBe('vata-pitta');
    expect(dto.recommendations).toHaveLength(1);
    expect(dto.recommendations[0].title).toBe('Warm Sesame Oil Abhyanga');
    expect(dto.recentVikritiLogs).toHaveLength(1);
    expect(dto.recentVikritiLogs[0].symptoms).toContain('dry_skin');
  });

  it('instantiates KnowledgeNode and formats DTO accurately', () => {
    const nodeDoc = new KnowledgeNodeModel({
      slug: 'advaita-vedanta',
      name: 'Advaita Vedanta',
      sanskritName: 'अद्वैत वेदान्त',
      entityType: 'tradition',
      summary: 'Non-dualistic school of Indian philosophy.',
      description: 'Systematized by Adi Shankara asserting identity of Atman and Brahman.',
      era: '8th Century CE',
      primarySources: ['Brahma Sutras', 'Upanishads'],
      tags: ['vedanta', 'non-dualism'],
      metadata: { founder: 'Adi Shankara' },
    });

    expect(nodeDoc.slug).toBe('advaita-vedanta');
    expect(nodeDoc.entityType).toBe('tradition');

    const dto = nodeDoc.toDTO();
    expect(dto.slug).toBe('advaita-vedanta');
    expect(dto.name).toBe('Advaita Vedanta');
    expect(dto.sanskritName).toBe('अद्वैत वेदान्त');
    expect(dto.primarySources).toContain('Brahma Sutras');
    expect(dto.tags).toContain('non-dualism');
  });

  it('instantiates KnowledgeEdge and formats DTO accurately', () => {
    const edgeDoc = new KnowledgeEdgeModel({
      sourceSlug: 'bhagavad-gita',
      targetSlug: 'nishkama-karma',
      relationship: 'expounds',
      description: 'Teaches action without attachment to fruits.',
      sourceReference: 'BG 2.47',
      weight: 10,
    });

    expect(edgeDoc.sourceSlug).toBe('bhagavad-gita');
    expect(edgeDoc.relationship).toBe('expounds');

    const dto = edgeDoc.toDTO();
    expect(dto.sourceSlug).toBe('bhagavad-gita');
    expect(dto.targetSlug).toBe('nishkama-karma');
    expect(dto.relationship).toBe('expounds');
    expect(dto.sourceReference).toBe('BG 2.47');
    expect(dto.weight).toBe(10);
  });
});

