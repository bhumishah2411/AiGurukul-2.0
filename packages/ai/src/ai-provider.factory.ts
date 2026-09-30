import { AIProvider } from './ai-provider.interface.js';
import { LocalAIProvider } from './local-ai.provider.js';

export class AIProviderFactory {
  public static create(providerType: string = 'local'): AIProvider {
    switch (providerType) {
      case 'local':
        return new LocalAIProvider();
      case 'openai':
      case 'anthropic':
      case 'gemini':
        // Placeholder for future phase API drivers; fall back to local provider in Phase 1
        return new LocalAIProvider();
      default:
        throw new Error(`Unsupported AIProvider type: ${providerType}`);
    }
  }
}
