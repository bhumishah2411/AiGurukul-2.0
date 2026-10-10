import { z } from 'zod';

export const GraphEntityTypeEnum = z.enum(['concept', 'text', 'tradition', 'author', 'practice']);

export const GraphRelationshipTypeEnum = z.enum([
  'expounds',
  'authored_by',
  'affiliated_with',
  'critiques',
  'influences',
  'part_of',
  'related_to',
]);

export const NodeSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug must not be empty')
    .max(100, 'Slug exceeds max length')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with dashes'),
});

export const GraphOverviewQuerySchema = z.object({
  type: GraphEntityTypeEnum.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const GraphSearchQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: GraphEntityTypeEnum.optional(),
  tag: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const GraphPathQuerySchema = z.object({
  source: z
    .string()
    .trim()
    .min(1, 'Source slug is required')
    .regex(/^[a-z0-9-]+$/, 'Source must be a valid slug'),
  target: z
    .string()
    .trim()
    .min(1, 'Target slug is required')
    .regex(/^[a-z0-9-]+$/, 'Target must be a valid slug'),
  maxDepth: z.coerce.number().int().min(1).max(6).default(4),
});

export type GraphOverviewQuery = z.infer<typeof GraphOverviewQuerySchema>;
export type GraphSearchQuery = z.infer<typeof GraphSearchQuerySchema>;
export type GraphPathQuery = z.infer<typeof GraphPathQuerySchema>;
export type NodeSlugParam = z.infer<typeof NodeSlugParamSchema>;
