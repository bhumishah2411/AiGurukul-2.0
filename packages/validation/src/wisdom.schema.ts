import { z } from 'zod';

export const WisdomQuerySchema = z.object({
  domain: z
    .enum([
      'gita',
      'chanakya',
      'ramayana',
      'mahabharata',
      'panchatantra',
      'ayurveda',
      'upanishads',
      'classical_texts',
    ])
    .optional(),
  query: z.string().min(1).max(500),
  persona: z.enum(['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali']).default('krishna'),
});

export const WisdomChatRequestSchema = z.object({
  conversationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  persona: z.enum(['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali']).default('krishna'),
  message: z.string().min(1).max(2000),
});
