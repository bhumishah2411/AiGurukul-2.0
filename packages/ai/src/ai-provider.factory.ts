import { AIProvider } from './ai-provider.interface.js';
import { LocalAIProvider } from './local-ai.provider.js';
import { GeminiAIProvider } from './gemini-ai.provider.js';
import { OpenAIProvider } from './openai-ai.provider.js';
import dotenv from 'dotenv';
import path from 'node:path';

// Load env vars if running standalone
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AIProviderFactoryOptions {
  apiKey?: string;
  model?: string;
}

export class AIProviderFactory {
  public static create(
    providerType?: string,
    options?: AIProviderFactoryOptions
  ): AIProvider {
    // 1. Determine provider type, checking explicit configuration or available server API keys
    let requestedType = (
      providerType ||
      process.env.AI_PROVIDER ||
      ''
    ).toLowerCase();

    // Auto-detect API key presence if provider wasn't explicitly forced to local
    if (!requestedType || (!providerType && requestedType === 'local')) {
      if (options?.apiKey?.startsWith('gsk_') || process.env.GROQ_API_KEY) {
        requestedType = 'groq';
      } else if (options?.apiKey || process.env.GEMINI_API_KEY) {
        requestedType = 'gemini';
      } else if (process.env.OPENAI_API_KEY) {
        requestedType = 'openai';
      } else {
        requestedType = 'local';
      }
    }

    switch (requestedType) {
      case 'groq': {
        const apiKey = options?.apiKey || process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.warn('⚠️ [AIProviderFactory] GROQ_API_KEY not configured. Falling back to LocalAIProvider.');
          return new LocalAIProvider();
        }
        let model = options?.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
        if (model === 'gpt-oss-120b') {
          model = 'openai/gpt-oss-120b';
        } else if (model === 'gpt-oss-20b') {
          model = 'openai/gpt-oss-20b';
        }
        return new OpenAIProvider(
          apiKey,
          model,
          'https://api.groq.com/openai/v1'
        );
      }
      case 'gemini': {
        const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.warn(
            '⚠️ [AIProviderFactory] GEMINI_API_KEY not configured. Falling back to LocalAIProvider.'
          );
          return new LocalAIProvider();
        }
        return new GeminiAIProvider(apiKey, options?.model || process.env.GEMINI_MODEL);
      }
      case 'openai': {
        const apiKey = options?.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
          console.warn(
            '⚠️ [AIProviderFactory] OPENAI_API_KEY not configured. Falling back to LocalAIProvider.'
          );
          return new LocalAIProvider();
        }
        return new OpenAIProvider(apiKey, options?.model || process.env.OPENAI_MODEL);
      }
      case 'anthropic': {
        console.warn(
          '⚠️ [AIProviderFactory] Anthropic provider routed via standard compliant interface / fallback.'
        );
        return new LocalAIProvider();
      }
      case 'local':
      default:
        return new LocalAIProvider();
    }
  }
}
