import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from workspace or standard location if present
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const CommonEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export const ApiEnvSchema = CommonEnvSchema.extend({
  PORT: z.coerce.number().default(10000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/aigurukul_dev'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Secrets (Provide sensible local dev defaults if not in production)
  JWT_ACCESS_SECRET: z.string().min(16).default('local_dev_jwt_access_secret_key_32chars!'),
  JWT_REFRESH_SECRET: z.string().min(16).default('local_dev_jwt_refresh_secret_key_32chars!'),
  COOKIE_SECRET: z.string().min(16).default('local_dev_cookie_secret_key_32chars!'),

  // Pluggable Provider Selection
  AI_PROVIDER: z.enum(['local', 'openai', 'anthropic', 'gemini', 'groq']).default('local'),
  EMBEDDING_PROVIDER: z.enum(['local', 'openai', 'cohere']).default('local'),
  VECTOR_STORE_PROVIDER: z.enum(['local', 'pinecone']).default('local'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),

  // Optional External Keys
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('openai/gpt-oss-120b'),
  GEMINI_MODEL: z.string().default('gemini-1.5-pro'),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
  LOCAL_STORAGE_DIR: z.string().default('.storage'),
});

export const WorkerEnvSchema = CommonEnvSchema.extend({
  MONGODB_URI: z.string().default('mongodb://localhost:27017/aigurukul_dev'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  WORKER_CONCURRENCY: z.coerce.number().default(3),
  EMBEDDING_PROVIDER: z.enum(['local', 'openai', 'cohere']).default('local'),
  VECTOR_STORE_PROVIDER: z.enum(['local', 'pinecone']).default('local'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  LOCAL_STORAGE_DIR: z.string().default('.storage'),
});

export type ApiConfig = z.infer<typeof ApiEnvSchema>;
export type WorkerConfig = z.infer<typeof WorkerEnvSchema>;

export function loadApiConfig(overrides?: Record<string, unknown>): ApiConfig {
  const isTest = (overrides?.NODE_ENV || process.env.NODE_ENV) === 'test';
  const baseEnv = isTest && !overrides?.AI_PROVIDER ? { ...process.env, AI_PROVIDER: 'local' } : process.env;
  const parsed = ApiEnvSchema.safeParse({ ...baseEnv, ...overrides });
  if (!parsed.success) {
    console.error('❌ Invalid API Environment Configuration:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('API configuration validation failed.');
  }
  return parsed.data;
}

export function loadWorkerConfig(overrides?: Record<string, unknown>): WorkerConfig {
  const parsed = WorkerEnvSchema.safeParse({ ...process.env, ...overrides });
  if (!parsed.success) {
    console.error('❌ Invalid Worker Environment Configuration:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Worker configuration validation failed.');
  }
  return parsed.data;
}
