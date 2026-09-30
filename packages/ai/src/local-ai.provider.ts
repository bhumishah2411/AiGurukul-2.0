import { AIProvider, AIMessage, AICompletionOptions } from './ai-provider.interface.js';

export class LocalAIProvider implements AIProvider {
  public readonly providerName = 'local';

  public async generateCompletion(
    messages: AIMessage[],
    _options?: AICompletionOptions
  ): Promise<string> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return `[AI Gurukul Local Guidance] Contemplating your inquiry: "${lastUserMessage}". Remember the timeless Vedic principle: steadfastness in duty without attachment to outcomes leads to supreme peace.`;
  }

  public async *streamCompletion(
    messages: AIMessage[],
    _options?: AICompletionOptions
  ): AsyncIterable<string> {
    const fullText = await this.generateCompletion(messages);
    const tokens = fullText.split(' ');

    for (const token of tokens) {
      yield token + ' ';
    }
  }

  public async generateStructuredOutput<T>(_messages: AIMessage[], _schema: unknown): Promise<T> {
    return {
      insight: 'Universal Dharma principle',
      guidance: 'Act with pure intention and equanimity.',
    } as unknown as T;
  }
}
