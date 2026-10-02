import { AIProvider, AIMessage, AICompletionOptions } from './ai-provider.interface.js';

export class LocalAIProvider implements AIProvider {
  public readonly providerName = 'local';

  public async generateCompletion(
    messages: AIMessage[],
    _options?: AICompletionOptions
  ): Promise<string> {
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
    const lastUserMsg =
      [...messages].reverse().find((m) => m.role === 'user')?.content || 'life guidance';

    // Persona-specific simulated Vedic intelligence
    if (systemMsg.includes('KRISHNA') || /krishna/i.test(lastUserMsg)) {
      return (
        `O Seeker, in the midst of turmoil and doubt, remember that your true self (Atman) is imperishable and beyond fear. ` +
        `As declared in <cite canonicalRef="BG 2.47">BG 2.47</cite>: "Your right is only to perform duty with dedicated awareness, never to anxious anticipation of results." ` +
        `When actions are offered selflessly without clinging to victory or defeat, the mind attains unshakable tranquility (Sthitaprajna). ` +
        `Elevate your spirit through internal mastery, as taught in <cite canonicalRef="BG 6.5">BG 6.5</cite>. Stand firm in your Svadharma.`
      );
    }

    if (systemMsg.includes('CHANAKYA') || /chanakya/i.test(lastUserMsg)) {
      return (
        `Noble strategist, clarity of intellect (buddhi) must always precede decisive action. ` +
        `In <cite canonicalRef="Arthashastra 1.7.1">Arthashastra 1.7.1</cite>, it is codified: "True power belongs to the disciplined ruler who cultivates self-restraint (vinaya) and tirelessly advances collective welfare." ` +
        `Do not let sentiment cloud strategic foresight. Evaluate incentives, foresee collateral consequences, and align your resources with unwavering discipline as taught in <cite canonicalRef="Chanakya Neeti 2.1">Chanakya Neeti 2.1</cite>.`
      );
    }

    if (systemMsg.includes('VAIDYA') || /ayurveda|health|dosha|vaidya/i.test(lastUserMsg)) {
      return (
        `Namaste, health is the foundational balance (samya) between your biological doshas (Vata, Pitta, Kapha), metabolic fire (Agni), and mental serenity. ` +
        `As revealed in <cite canonicalRef="Charaka Samhita Sutrasthana 1.41">Charaka Samhita Sutrasthana 1.41</cite>, Ayurveda guides the integration of wholesome nutrition, circadian routine (dinacharya), and season-aware living. ` +
        `Observe where subtle imbalances manifest in your daily life, and restore equilibrium gently through nature's rhythm.`
      );
    }

    if (systemMsg.includes('PATANJALI') || /yoga|meditat/i.test(lastUserMsg)) {
      return (
        `Quiet the external noise. As documented in <cite canonicalRef="Katha Upanishad 1.3.3">Katha Upanishad 1.3.3</cite>, the intellect is the charioteer and the mind is the reins. ` +
        `Yoga is the intentional settling of mental whirlpools (Citta-Vritti-Nirodha). Cultivate consistent practice (abhyasa) alongside serene dispassion (vairagya) to perceive truth unobstructed.`
      );
    }

    // Default universal Vedic response
    return (
      `Greetings seeker. In contemplation of your inquiry regarding "${lastUserMsg}": ` +
      `Remember the timeless Vedic principle: inner clarity begins with self-knowledge and duty without attachment. ` +
      `As illuminated in <cite canonicalRef="BG 2.47">BG 2.47</cite>, steady action aligned with Dharma dispels anxiety and anchors you in enduring purpose.`
    );
  }

  public async *streamCompletion(
    messages: AIMessage[],
    options?: AICompletionOptions
  ): AsyncIterable<string> {
    const fullText = await this.generateCompletion(messages, options);
    // Split into readable semantic token chunks
    const words = fullText.split(' ');

    for (let i = 0; i < words.length; i++) {
      // Yield 1-2 words per tick to simulate natural streaming
      const token = i < words.length - 1 ? words[i] + ' ' : words[i];
      yield token;
    }
  }

  public async generateStructuredOutput<T>(_messages: AIMessage[], _schema: unknown): Promise<T> {
    return {
      insight: 'Universal Dharma principle',
      guidance: 'Act with pure intention and equanimity.',
    } as unknown as T;
  }
}
