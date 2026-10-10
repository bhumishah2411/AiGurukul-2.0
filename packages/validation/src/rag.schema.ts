import { z } from 'zod';

export const DocumentUploadSchema = z.object({
  title: z
    .string({ required_error: 'Document title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  domain: z
    .string({ required_error: 'Domain is required' })
    .trim()
    .min(2, 'Domain must be at least 2 characters')
    .max(100, 'Domain cannot exceed 100 characters'),
  content: z
    .string({ required_error: 'Document content is required' })
    .min(10, 'Content must be at least 10 characters'),
  fileName: z.string().trim().max(255).optional(),
  mimeType: z.string().trim().default('text/plain'),
  author: z.string().trim().max(100).optional(),
  era: z.string().trim().max(100).optional(),
  language: z.string().trim().max(20).default('en'),
});

export const DocumentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  domain: z.string().trim().optional(),
  status: z
    .enum(['pending', 'extracting', 'chunking', 'embedding', 'indexed', 'failed'])
    .optional(),
  search: z.string().trim().optional(),
});

export const DocumentIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Document ID is required' })
    .trim()
    .min(1, 'Document ID cannot be empty'),
});

export const RAGQuerySchema = z.object({
  query: z
    .string({ required_error: 'Query string is required' })
    .trim()
    .min(3, 'Query must be at least 3 characters')
    .max(1000, 'Query cannot exceed 1000 characters'),
  topK: z.coerce.number().int().min(1).max(20).default(5),
  minScore: z.coerce.number().min(0).max(1).default(0.01),
  domainFilter: z.string().trim().optional(),
});

export type DocumentUploadInput = z.infer<typeof DocumentUploadSchema>;
export type DocumentListQueryInput = z.infer<typeof DocumentListQuerySchema>;
export type DocumentIdParamInput = z.infer<typeof DocumentIdParamSchema>;
export type RAGQueryInput = z.infer<typeof RAGQuerySchema>;
