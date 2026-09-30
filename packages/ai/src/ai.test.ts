import { describe, it, expect } from 'vitest';
import { AIProviderFactory, LocalAIProvider } from './index.js';

describe('AI Provider Package Unit Tests', () => {
  it('creates LocalAIProvider via factory by default', () => {
    const provider = AIProviderFactory.create('local');
    expect(provider).toBeInstanceOf(LocalAIProvider);
    expect(provider.providerName).toBe('local');
  });

  it('generates text completion with local provider', async () => {
    const provider = new LocalAIProvider();
    const result = await provider.generateCompletion([
      { role: 'user', content: 'What is duty in the Gita?' },
    ]);
    expect(result).toContain('What is duty in the Gita?');
    expect(result).toContain('Vedic principle');
  });

  it('streams completion tokens correctly', async () => {
    const provider = new LocalAIProvider();
    const chunks: string[] = [];
    for await (const chunk of provider.streamCompletion([
      { role: 'user', content: 'Explain equanimity' },
    ])) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toContain('equanimity');
  });
});
