import { z } from 'zod';

export const PersonaEnum = z.enum(['krishna', 'chanakya', 'vaidya', 'vyasa', 'patanjali']);

export const WisdomDomainEnum = z.enum([
  'gita',
  'chanakya',
  'ramayana',
  'mahabharata',
  'panchatantra',
  'ayurveda',
  'upanishads',
  'classical_texts',
]);

export const CreateConversationSchema = z.object({
  persona: PersonaEnum.default('krishna'),
  title: z.string().min(1).max(120).trim().optional(),
  initialMessage: z.string().min(1).max(2000).trim().optional(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(3000).trim(),
  stream: z.boolean().default(true).optional(),
});

export const ConversationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  persona: PersonaEnum.optional(),
  status: z.enum(['active', 'archived']).default('active').optional(),
});

export const WisdomVerseQuerySchema = z.object({
  domain: WisdomDomainEnum.optional(),
  theme: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const WisdomQuerySchema = z.object({
  domain: WisdomDomainEnum.optional(),
  query: z.string().min(1).max(500),
  persona: PersonaEnum.default('krishna'),
});

export const WisdomChatRequestSchema = z.object({
  conversationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  persona: PersonaEnum.default('krishna'),
  message: z.string().min(1).max(2000),
});
