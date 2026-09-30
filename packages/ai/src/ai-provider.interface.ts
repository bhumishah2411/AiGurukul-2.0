export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  responseFormat?: 'text' | 'json';
}

export interface AIProvider {
  readonly providerName: string;

  generateCompletion(messages: AIMessage[], options?: AICompletionOptions): Promise<string>;

  streamCompletion(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<string>;

  generateStructuredOutput<T>(messages: AIMessage[], schema: unknown): Promise<T>;
}
