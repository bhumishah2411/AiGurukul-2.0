import { z } from 'zod';

export const quizDomainSchema = z.enum([
  'gita',
  'chanakya',
  'upanishads',
  'ayurveda',
  'mahabharata',
  'ramayana',
  'panchatantra',
  'general',
]);

export const quizDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const quizQuestionSchema = z
  .object({
    questionText: z.string().min(5, 'Question text must be at least 5 characters'),
    options: z
      .array(z.string().min(1))
      .min(2, 'At least 2 options are required')
      .max(6, 'Maximum 6 options allowed'),
    correctIndex: z.number().int().min(0, 'Correct index must be non-negative'),
    explanation: z.string().min(5, 'Explanation must be provided'),
    sourceRef: z.string().optional(),
  })
  .refine((data) => data.correctIndex < data.options.length, {
    message: 'Correct index must be within range of options',
    path: ['correctIndex'],
  });

export const createQuizSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  domain: quizDomainSchema,
  difficulty: quizDifficultySchema,
  questions: z.array(quizQuestionSchema).min(1, 'Quiz must have at least one question'),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isDynamic: z.boolean().default(false),
});

export const submitQuizAnswerSchema = z.object({
  questionIndex: z.number().int().min(0),
  selectedIndex: z.number().int().min(0),
});

export const submitQuizAttemptSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.array(submitQuizAnswerSchema).min(1, 'At least one answer must be submitted'),
  timeSpentSeconds: z.number().min(0).optional(),
});

export const generateDynamicQuizSchema = z.object({
  domain: quizDomainSchema,
  topic: z.string().max(200).optional(),
  difficulty: quizDifficultySchema.default('intermediate'),
  questionCount: z.number().int().min(1).max(20).default(5),
  language: z.enum(['en', 'hi', 'sa']).default('en'),
});

export const quizFilterSchema = z.object({
  domain: quizDomainSchema.optional(),
  difficulty: quizDifficultySchema.optional(),
  tag: z.string().optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});
