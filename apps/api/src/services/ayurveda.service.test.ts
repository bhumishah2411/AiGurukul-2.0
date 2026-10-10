import { describe, it, expect, vi } from 'vitest';
import { AyurvedaService } from './ayurveda.service.js';
import { AyurvedaProfileRepository } from '../repositories/ayurveda-profile.repository.js';
import { AYURVEDA_QUESTIONNAIRE } from './ayurveda-knowledge.js';

describe('AyurvedaService Unit Tests (Phase 4A)', () => {
  const mockRepo = {
    findByUserId: vi.fn(),
    upsertProfile: vi.fn(),
    addVikritiLog: vi.fn(),
  } as unknown as AyurvedaProfileRepository;

  const service = new AyurvedaService(mockRepo);

  it('returns all 18 classical diagnostic questions', () => {
    const questions = service.getQuestionnaire();
    expect(questions).toHaveLength(18);

    const categories = new Set(questions.map((q) => q.category));
    expect(categories).toContain('physical');
    expect(categories).toContain('physiological');
    expect(categories).toContain('psychological');
  });

  it('calculates pure Vata-dominant Prakriti when Vata answers are predominantly chosen', () => {
    const vataAnswers = AYURVEDA_QUESTIONNAIRE.map((q) => ({
      questionId: q.id,
      selectedOptionId: q.options.find((opt) => opt.dosha === 'vata')!.id,
    }));

    const result = service.calculatePrakriti(vataAnswers);
    expect(result.vata).toBe(100);
    expect(result.pitta).toBe(0);
    expect(result.kapha).toBe(0);
    expect(result.dominantDosha).toBe('vata');
  });

  it('calculates dual-dosha (Pitta-Kapha) constitution correctly', () => {
    // 10 Pitta answers, 8 Kapha answers, 0 Vata
    const answers = AYURVEDA_QUESTIONNAIRE.map((q, idx) => ({
      questionId: q.id,
      selectedOptionId:
        idx < 10
          ? q.options.find((opt) => opt.dosha === 'pitta')!.id
          : q.options.find((opt) => opt.dosha === 'kapha')!.id,
    }));

    const result = service.calculatePrakriti(answers);
    expect(result.pitta).toBeGreaterThan(result.kapha);
    expect(result.vata).toBe(0);
    expect(result.dominantDosha).toBe('pitta-kapha');
    expect(result.secondaryDosha).toBe('kapha');
  });

  it('identifies Tridoshic balance when responses are evenly divided', () => {
    // 6 Vata, 6 Pitta, 6 Kapha
    const answers = AYURVEDA_QUESTIONNAIRE.map((q, idx) => ({
      questionId: q.id,
      selectedOptionId:
        idx < 6
          ? q.options.find((opt) => opt.dosha === 'vata')!.id
          : idx < 12
            ? q.options.find((opt) => opt.dosha === 'pitta')!.id
            : q.options.find((opt) => opt.dosha === 'kapha')!.id,
    }));

    const result = service.calculatePrakriti(answers);
    expect(result.dominantDosha).toBe('tridoshic');
    expect(result.vata + result.pitta + result.kapha).toBe(100);
  });

  it('evaluates acute symptoms and flags elevated doshas accurately', () => {
    const vataSymptoms = ['insomnia', 'dry_skin', 'anxiety'];
    const elevated = service.evaluateSymptoms(vataSymptoms);
    expect(elevated).toContain('vata');
    expect(elevated).not.toContain('kapha');
  });

  it('generates personalized recommendations matching constitution and imbalances', () => {
    const prakriti = {
      vata: 60,
      pitta: 25,
      kapha: 15,
      dominantDosha: 'vata' as const,
    };

    const recs = service.generateRecommendations(prakriti, ['vata']);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.category === 'diet')).toBe(true);
    expect(recs.some((r) => r.category === 'herbs')).toBe(true);
  });
});
