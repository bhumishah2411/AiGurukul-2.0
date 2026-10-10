import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizService } from './quiz.service.js';
import { QuizRepository } from '../repositories/quiz.repository.js';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository.js';
import { AIProvider } from '@ai-gurukul/ai';
import { Types } from 'mongoose';
import { CANONICAL_SEED_QUIZZES } from '@ai-gurukul/database';

describe('QuizService Unit Tests (Phase 5B)', () => {
  let mockQuizRepo: any;
  let mockAttemptRepo: any;
  let mockAiProvider: AIProvider;
  let service: QuizService;

  const sampleQuizId = new Types.ObjectId().toString();
  const sampleQuizDoc: any = {
    _id: new Types.ObjectId(sampleQuizId),
    title: 'Gita Fundamentals',
    description: 'Test Quiz',
    domain: 'gita',
    difficulty: 'beginner',
    isActive: true,
    isDynamic: false,
    tags: ['gita', 'karma'],
    questions: [
      {
        questionText: 'What is Nishkama Karma?',
        options: ['Selfless action', 'Selfish action', 'Inaction', 'Ritualism'],
        correctIndex: 0,
        explanation: 'BG 2.47 teaches action without craving rewards.',
        sourceRef: 'BG 2.47',
      },
      {
        questionText: 'What is Sthitaprajna?',
        options: ['Disturbed mind', 'Poised steadfast intellect', 'Sleeping seeker', 'Warrior'],
        correctIndex: 1,
        explanation: 'BG 2.56 teaches poise in joy and sorrow.',
        sourceRef: 'BG 2.56',
      },
    ],
    toDTO: vi.fn(),
    toClientDTO: vi.fn().mockReturnValue({
      id: sampleQuizId,
      title: 'Gita Fundamentals',
      domain: 'gita',
      difficulty: 'beginner',
      totalQuestions: 2,
      questions: [
        {
          questionIndex: 0,
          questionText: 'What is Nishkama Karma?',
          options: ['Selfless action', 'Selfish action', 'Inaction', 'Ritualism'],
        },
        {
          questionIndex: 1,
          questionText: 'What is Sthitaprajna?',
          options: ['Disturbed mind', 'Poised steadfast intellect', 'Sleeping seeker', 'Warrior'],
        },
      ],
      tags: ['gita', 'karma'],
    }),
    toSummaryDTO: vi.fn().mockReturnValue({
      id: sampleQuizId,
      title: 'Gita Fundamentals',
      domain: 'gita',
      difficulty: 'beginner',
      questionCount: 2,
      tags: ['gita'],
      isActive: true,
    }),
  };

  beforeEach(() => {
    mockQuizRepo = {
      ensureSeeded: vi.fn().mockResolvedValue(CANONICAL_SEED_QUIZZES.length),
      findFiltered: vi.fn().mockResolvedValue({ quizzes: [sampleQuizDoc], total: 1 }),
      findById: vi.fn().mockResolvedValue(sampleQuizDoc),
      createQuiz: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          ...sampleQuizDoc,
          title: data.title,
          domain: data.domain,
          questions: data.questions,
          toDTO: () => ({ id: sampleQuizId, ...data }),
          toClientDTO: () => ({ id: sampleQuizId, ...data, totalQuestions: data.questions.length }),
        })
      ),
    };

    mockAttemptRepo = {
      recordAttempt: vi.fn().mockImplementation((data) => ({
        toDTO: () => ({
          id: new Types.ObjectId().toString(),
          ...data,
          completedAt: new Date().toISOString(),
        }),
      })),
      findByUser: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      getUserStats: vi
        .fn()
        .mockResolvedValue({
          totalAttempts: 1,
          passedAttempts: 1,
          averageScore: 100,
          highestScore: 100,
        }),
    };

    mockAiProvider = {
      providerName: 'mock-ai',
      generateCompletion: vi.fn().mockResolvedValue(
        JSON.stringify([
          {
            questionText: 'What is the true nature of Atman?',
            options: ['Perishable', 'Eternal and Imperishable', 'Fading', 'Illusory'],
            correctIndex: 1,
            explanation: 'BG 2.20 teaches Atman is indestructible.',
            sourceRef: 'BG 2.20',
          },
        ])
      ),
      streamCompletion: vi.fn(),
      generateStructuredOutput: vi.fn(),
    };

    service = new QuizService(mockQuizRepo, mockAttemptRepo, mockAiProvider);
  });

  it('correctly retrieves quiz list and converts to summaries', async () => {
    const res = await service.getQuizzes({ domain: 'gita', limit: 10 });
    expect(mockQuizRepo.findFiltered).toHaveBeenCalledWith({ domain: 'gita', limit: 10 });
    expect(res.total).toBe(1);
    expect(res.quizzes[0].title).toBe('Gita Fundamentals');
  });

  it('returns client-safe quiz payload hiding correctIndex and explanations', async () => {
    const clientQuiz = await service.getQuizById(sampleQuizId);
    expect(clientQuiz.id).toBe(sampleQuizId);
    expect(clientQuiz.questions).toHaveLength(2);
    // Verified questions in client DTO do not have correctIndex or explanation
    expect((clientQuiz.questions[0] as any).correctIndex).toBeUndefined();
    expect((clientQuiz.questions[0] as any).explanation).toBeUndefined();
  });

  it('accurately evaluates 100% score and passed status on all correct answers', async () => {
    const attemptResult = await service.submitAttempt({
      quizId: sampleQuizId,
      answers: [
        { questionIndex: 0, selectedIndex: 0 },
        { questionIndex: 1, selectedIndex: 1 },
      ],
      timeSpentSeconds: 45,
    });

    expect(attemptResult.score).toBe(2);
    expect(attemptResult.totalQuestions).toBe(2);
    expect(attemptResult.percentage).toBe(100);
    expect(attemptResult.passed).toBe(true);
    expect(attemptResult.weakAreas).toHaveLength(0);
    expect(attemptResult.answers[0].isCorrect).toBe(true);
    expect(attemptResult.answers[1].isCorrect).toBe(true);
  });

  it('accurately marks incorrect answers, provides explanations, and compiles weak areas', async () => {
    const attemptResult = await service.submitAttempt({
      quizId: sampleQuizId,
      answers: [
        { questionIndex: 0, selectedIndex: 1 }, // Wrong
        { questionIndex: 1, selectedIndex: 1 }, // Correct
      ],
      timeSpentSeconds: 30,
    });

    expect(attemptResult.score).toBe(1);
    expect(attemptResult.percentage).toBe(50);
    expect(attemptResult.passed).toBe(false); // < 60%
    expect(attemptResult.weakAreas).toContain('BG 2.47');
    expect(attemptResult.answers[0].isCorrect).toBe(false);
    expect(attemptResult.answers[0].explanation).toBe(
      'BG 2.47 teaches action without craving rewards.'
    );
  });

  it('generates dynamic AI quiz using AIProvider', async () => {
    const dynamicQuiz = await service.generateDynamicQuiz({
      domain: 'gita',
      topic: 'Sthitaprajna',
      difficulty: 'intermediate',
      questionCount: 1,
    });

    expect(mockAiProvider.generateCompletion).toHaveBeenCalled();
    expect(mockQuizRepo.createQuiz).toHaveBeenCalled();
    expect(dynamicQuiz.title).toContain('Sthitaprajna');
  });

  it('falls back seamlessly to curated question bank if AI returns invalid JSON', async () => {
    (mockAiProvider.generateCompletion as any).mockResolvedValueOnce('Invalid non-json output');

    const dynamicQuiz = await service.generateDynamicQuiz({
      domain: 'ayurveda',
      difficulty: 'beginner',
      questionCount: 2,
    });

    expect(mockQuizRepo.createQuiz).toHaveBeenCalled();
    expect(dynamicQuiz.domain).toBe('ayurveda');
  });
});
