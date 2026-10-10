import { z } from 'zod';

export const PrakritiAnswerItemSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  selectedOptionId: z.string().min(1, 'Selected option ID is required'),
});

export const SubmitPrakritiAnswersSchema = z.object({
  answers: z
    .array(PrakritiAnswerItemSchema)
    .min(12, 'At least 12 questions must be answered for an accurate Prakriti assessment')
    .max(30, 'Exceeded maximum question count'),
});

export const LogSymptomsSchema = z.object({
  symptoms: z
    .array(z.string().min(1, 'Symptom identifier cannot be empty'))
    .min(1, 'At least one symptom must be selected for analysis')
    .max(25, 'Maximum 25 symptoms can be evaluated concurrently'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const AyurvedaCategoryQuerySchema = z.object({
  category: z.enum(['diet', 'routine', 'herbs', 'seasonal', 'lifestyle']).optional(),
});

export type SubmitPrakritiAnswersInput = z.infer<typeof SubmitPrakritiAnswersSchema>;
export type LogSymptomsInput = z.infer<typeof LogSymptomsSchema>;
