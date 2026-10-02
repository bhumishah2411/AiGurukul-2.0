import {
  ConversationRepository,
  MessageRepository,
  WisdomVerseRepository,
  UserRepository,
} from '../repositories/index.js';
import { AIProvider, AIMessage } from '@ai-gurukul/ai';
import { Logger } from '@ai-gurukul/logging';
import {
  ConversationDTO,
  ConversationWithMessagesDTO,
  MessageCitation,
  MessageDTO,
  NotFoundError,
  PersonaInfo,
  StreamDoneEvent,
  WisdomDomain,
  WisdomPersona,
  WisdomVerseDTO,
} from '@ai-gurukul/types';
import { PERSONA_REGISTRY, buildPersonaSystemPrompt, extractCitations } from './persona-prompt.js';

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onCitation?: (citation: MessageCitation) => void;
  onDone: (data: StreamDoneEvent) => void;
  onError: (err: Error) => void;
}

export class WisdomService {
  private readonly conversationRepo: ConversationRepository;
  private readonly messageRepo: MessageRepository;
  private readonly verseRepo: WisdomVerseRepository;
  private readonly userRepo: UserRepository;
  private readonly aiProvider: AIProvider;
  private readonly logger: Logger;

  constructor(
    conversationRepo: ConversationRepository,
    messageRepo: MessageRepository,
    verseRepo: WisdomVerseRepository,
    userRepo: UserRepository,
    aiProvider: AIProvider,
    logger: Logger
  ) {
    this.conversationRepo = conversationRepo;
    this.messageRepo = messageRepo;
    this.verseRepo = verseRepo;
    this.userRepo = userRepo;
    this.aiProvider = aiProvider;
    this.logger = logger;
  }

  /**
   * Returns list of available wisdom personas with metadata and guidance topics.
   */
  public getPersonas(): PersonaInfo[] {
    return Object.values(PERSONA_REGISTRY);
  }

  /**
   * Starts a new conversation thread with a selected wisdom persona.
   */
  public async startConversation(
    userId: string,
    persona: WisdomPersona,
    title?: string,
    initialMessage?: string
  ): Promise<ConversationWithMessagesDTO> {
    await this.verseRepo.ensureSeeded();

    const meta = PERSONA_REGISTRY[persona] || PERSONA_REGISTRY.krishna;
    const conversationTitle =
      title ||
      (initialMessage ? initialMessage.slice(0, 40) + '...' : `Dialogue with ${meta.name}`);

    const conversation = await this.conversationRepo.createConversation({
      userId,
      persona,
      title: conversationTitle,
    });

    const messages: MessageDTO[] = [];

    // If initial message supplied, execute initial AI guidance exchange
    if (initialMessage) {
      // 1. Record user message
      const userMsg = await this.messageRepo.createMessage({
        conversationId: conversation._id.toString(),
        sender: 'user',
        content: initialMessage,
      });
      messages.push(userMsg.toDTO());

      // 2. Fetch context verses
      const relevantVerses = await this.verseRepo.getRelevantVersesForPersona(persona);
      const verseDTOs = relevantVerses.map((v) => v.toDTO());

      // 3. Generate initial response
      const systemPrompt = buildPersonaSystemPrompt(persona, undefined, verseDTOs);
      const aiResponse = await this.aiProvider.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: initialMessage },
      ]);

      const citations = extractCitations(aiResponse, verseDTOs);
      const assistantMsg = await this.messageRepo.createMessage({
        conversationId: conversation._id.toString(),
        sender: 'assistant',
        content: aiResponse,
        citations,
        tokenUsage: {
          promptTokens: initialMessage.length / 4,
          completionTokens: aiResponse.length / 4,
          totalTokens: (initialMessage.length + aiResponse.length) / 4,
        },
      });
      messages.push(assistantMsg.toDTO());

      await this.conversationRepo.updateActivity(conversation._id.toString(), 2);
    }

    return {
      ...conversation.toDTO(),
      messages,
    };
  }

  /**
   * Retrieves user conversations with pagination.
   */
  public async getUserConversations(
    userId: string,
    filters: { persona?: WisdomPersona; status?: string } = {},
    page = 1,
    limit = 20
  ) {
    const paginated = await this.conversationRepo.findUserConversations(userId, filters, {
      page,
      limit,
    });

    return {
      items: paginated.items.map((c) => c.toDTO()),
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
    };
  }

  /**
   * Retrieves single conversation along with its full chronological message thread.
   */
  public async getConversationWithMessages(
    conversationId: string,
    userId: string
  ): Promise<ConversationWithMessagesDTO> {
    const conversation = await this.conversationRepo.findByIdAndUser(conversationId, userId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found or access denied');
    }

    const messages = await this.messageRepo.findByConversationId(conversationId, 100);

    return {
      ...conversation.toDTO(),
      messages: messages.map((m) => m.toDTO()),
    };
  }

  /**
   * Streams AI completion tokens and citations via Server-Sent Events (SSE).
   */
  public async streamMessage(
    conversationId: string,
    userId: string,
    query: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      // 1. Verify conversation ownership
      const conversation = await this.conversationRepo.findByIdAndUser(conversationId, userId);
      if (!conversation) {
        throw new NotFoundError('Conversation not found');
      }

      // 2. Fetch user profile for personal greeting
      const user = await this.userRepo.findById(userId);
      const userName = user?.displayName;

      // 3. Save incoming user message
      await this.messageRepo.createMessage({
        conversationId,
        sender: 'user',
        content: query,
      });

      // 4. Fetch context window and verses
      const recentMessages = await this.messageRepo.getRecentContextWindow(conversationId, 8);
      const relevantVerses = await this.verseRepo.getRelevantVersesForPersona(conversation.persona);
      const verseDTOs = relevantVerses.map((v) => v.toDTO());

      // 5. Construct persona prompt
      const systemPrompt = buildPersonaSystemPrompt(conversation.persona, userName, verseDTOs);

      const aiMessages: AIMessage[] = [{ role: 'system', content: systemPrompt }];

      for (const m of recentMessages) {
        aiMessages.push({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        });
      }

      // 6. Invoke streaming provider
      let fullContent = '';
      const stream = this.aiProvider.streamCompletion(aiMessages);

      for await (const token of stream) {
        fullContent += token;
        callbacks.onToken(token);
      }

      // 7. Extract citations
      const citations = extractCitations(fullContent, verseDTOs);
      if (callbacks.onCitation) {
        for (const citation of citations) {
          callbacks.onCitation(citation);
        }
      }

      // 8. Persist assistant message with citations
      const tokenUsage = {
        promptTokens: Math.ceil(query.length / 4),
        completionTokens: Math.ceil(fullContent.length / 4),
        totalTokens: Math.ceil((query.length + fullContent.length) / 4),
      };

      const assistantMsg = await this.messageRepo.createMessage({
        conversationId,
        sender: 'assistant',
        content: fullContent,
        citations,
        tokenUsage,
      });

      // 9. Update conversation timestamps
      await this.conversationRepo.updateActivity(conversationId, 2);

      // 10. Signal completion
      callbacks.onDone({
        conversationId,
        messageId: assistantMsg._id.toString(),
        fullContent,
        citations,
        tokenUsage,
      });
    } catch (err: unknown) {
      this.logger.error({ err, conversationId, userId }, 'Error in wisdom streamMessage');
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Synchronous message fallback (non-streaming).
   */
  public async sendMessageSync(
    conversationId: string,
    userId: string,
    query: string
  ): Promise<MessageDTO> {
    const conversation = await this.conversationRepo.findByIdAndUser(conversationId, userId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const user = await this.userRepo.findById(userId);

    // Save user message
    await this.messageRepo.createMessage({
      conversationId,
      sender: 'user',
      content: query,
    });

    const recentMessages = await this.messageRepo.getRecentContextWindow(conversationId, 8);
    const relevantVerses = await this.verseRepo.getRelevantVersesForPersona(conversation.persona);
    const verseDTOs = relevantVerses.map((v) => v.toDTO());

    const systemPrompt = buildPersonaSystemPrompt(
      conversation.persona,
      user?.displayName,
      verseDTOs
    );

    const aiMessages: AIMessage[] = [{ role: 'system', content: systemPrompt }];
    for (const m of recentMessages) {
      aiMessages.push({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      });
    }

    const completion = await this.aiProvider.generateCompletion(aiMessages);
    const citations = extractCitations(completion, verseDTOs);

    const assistantMsg = await this.messageRepo.createMessage({
      conversationId,
      sender: 'assistant',
      content: completion,
      citations,
      tokenUsage: {
        promptTokens: Math.ceil(query.length / 4),
        completionTokens: Math.ceil(completion.length / 4),
        totalTokens: Math.ceil((query.length + completion.length) / 4),
      },
    });

    await this.conversationRepo.updateActivity(conversationId, 2);

    return assistantMsg.toDTO();
  }

  /**
   * Archives a conversation.
   */
  public async archiveConversation(conversationId: string, userId: string): Promise<void> {
    const updated = await this.conversationRepo.archiveConversation(conversationId, userId);
    if (!updated) {
      throw new NotFoundError('Conversation not found');
    }
  }

  /**
   * Searches and retrieves canonical Vedic verses with commentaries.
   */
  public async getWisdomVerses(
    query: { domain?: WisdomDomain; theme?: string; search?: string },
    page = 1,
    limit = 20
  ) {
    await this.verseRepo.ensureSeeded();
    const result = await this.verseRepo.searchVerses(query, { page, limit });

    return {
      items: result.items.map((v) => v.toDTO()),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
