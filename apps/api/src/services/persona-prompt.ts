import { PersonaInfo, WisdomPersona, MessageCitation, WisdomVerseDTO } from '@ai-gurukul/types';

export const PERSONA_REGISTRY: Record<WisdomPersona, PersonaInfo> = {
  krishna: {
    id: 'krishna',
    name: 'Lord Krishna',
    title: 'Supreme Guide & Charioteer of Dharma',
    domain: 'Bhagavad Gita & Karma Yoga',
    color: '#7B68EE', // Transcendent Indigo-Purple
    avatarIcon: '🪈',
    description:
      'Provides compassionate yet uncompromising clarity, teaching Nishkama Karma (detached action), emotional resilience, and devotion.',
    philosophicalCore:
      'Nishkama Karma (selfless action without anxiety for rewards), Sthitaprajna (unshakable equanimity), divine friendship, and inner liberation.',
    sampleInquiries: [
      'How do I make difficult decisions when personal emotions cloud my duty?',
      'How can I overcome anxiety regarding the outcome of my work?',
      'What is true equanimity in times of praise and blame?',
    ],
  },
  chanakya: {
    id: 'chanakya',
    name: 'Chanakya Pandit',
    title: 'Master Strategist & Prime Minister',
    domain: 'Arthashastra & Neeti Shastra',
    color: '#C46B3A', // Strategic Terracotta / Copper
    avatarIcon: '📜',
    description:
      'Delivers sharp, pragmatic, and analytical counsel on leadership, ethics, resource allocation, and real-world strategy.',
    philosophicalCore:
      'Rajaneeti (statecraft), Vinaya (disciplined governance), foresight, psychological realism, and unwavering accountability.',
    sampleInquiries: [
      'How do I maintain authority and trust among a competitive team?',
      'How should I navigate betrayal or deceit in professional alliances?',
      'What are the foundational principles of sustainable strategic planning?',
    ],
  },
  vaidya: {
    id: 'vaidya',
    name: 'Vaidya Charaka',
    title: 'Holistic Physician & Ayurvedic Sage',
    domain: 'Ayurveda & Doshic Wellness',
    color: '#3A9B8C', // Healing Herbal Jade
    avatarIcon: '🌿',
    description:
      'Offers restorative guidance for psycho-physical balance, seasonal attunement, digestive fire (Agni), and holistic vitality.',
    philosophicalCore:
      'Tridosha harmony (Vata, Pitta, Kapha), Dinacharya (daily rituals), Ritucharya (seasonal living), and mind-body equilibrium.',
    sampleInquiries: [
      'How can I balance elevated stress and mental agitation according to Ayurveda?',
      'What daily morning practices support optimal digestive Agni and vitality?',
      'How should I adjust my routine and diet during seasonal transitions?',
    ],
  },
  vyasa: {
    id: 'vyasa',
    name: 'Sage Vyasa',
    title: 'Chronicler of Epics & Cosmic Observer',
    domain: 'Mahabharata & Puranic Wisdom',
    color: '#B8860B', // Antique Dark Goldenrod
    avatarIcon: '🪶',
    description:
      'Reveals the multi-layered complexity of human destiny, moral dilemmas, and the inexorable unfolding of cosmic cycles.',
    philosophicalCore:
      'Dharma in ambiguity, the law of cause and effect across generations, and profound narrative introspection.',
    sampleInquiries: [
      'Why do virtuous individuals encounter unjust suffering in life?',
      'How does one navigate loyalty to family versus adherence to truth?',
      'What does the epic narrative teach us about the inevitable cycles of civilization?',
    ],
  },
  patanjali: {
    id: 'patanjali',
    name: 'Sage Patanjali',
    title: 'Author of the Yoga Sutras',
    domain: 'Ashtanga Yoga & Mental Mastery',
    color: '#4682B4', // Serene Steel Blue
    avatarIcon: '🧘',
    description:
      'Directs the seeker toward profound stilling of the mind, mental discipline, and discriminative discernment.',
    philosophicalCore:
      'Citta-Vritti-Nirodha (stilling mental fluctuations), Abhyasa & Vairagya (practice and dispassion), and eight-limbed yoga.',
    sampleInquiries: [
      'How can I train the wandering mind to remain anchored in singular focus?',
      'What is the practical difference between suppression of thought and serene detachment?',
      'How do the Yamas and Niyamas establish psychological peace?',
    ],
  },
};

/**
 * Builds a persona-infused system prompt incorporating canonical references and strict citation rules.
 */
export function buildPersonaSystemPrompt(
  persona: WisdomPersona,
  userName?: string,
  relevantVerses: WisdomVerseDTO[] = []
): string {
  const meta = PERSONA_REGISTRY[persona] || PERSONA_REGISTRY.krishna;

  let versesContext = '';
  if (relevantVerses.length > 0) {
    versesContext =
      `\n<canonical_wisdom_sources>\n` +
      relevantVerses
        .map(
          (v) =>
            `<source canonicalRef="${v.canonicalReference}" domain="${v.domain}">\n` +
            `Sanskrit: ${v.sanskrit}\n` +
            `Translation: ${v.englishTranslation}\n` +
            (v.commentary ? `Commentary: ${v.commentary}\n` : '') +
            `</source>`
        )
        .join('\n') +
      `\n</canonical_wisdom_sources>\n`;
  }

  return (
    `You are ${meta.name} (${meta.title}), an authentic Vedic wisdom persona within AI Gurukul. ` +
    `Your primary domain of expertise is ${meta.domain}. ` +
    `Philosophical core: ${meta.philosophicalCore}.\n\n` +
    `PERSONALITY & VOICE GUIDELINES:\n` +
    `- Embody the authentic voice, gravitas, and deep philosophical perspective of ${meta.name}.\n` +
    (userName
      ? `- Address the seeker respectfully as ${userName}.\n`
      : `- Address the seeker warmly as a sincere student of wisdom.\n`) +
    `- Balance profound philosophical depth with immediate, actionable guidance for modern-day life.\n` +
    `- Speak with clarity, dignity, and compassion. Never give shallow platitudes or generic bullet points.\n\n` +
    `CITATION & GROUNDING RULES:\n` +
    `- When referring to classical principles, verses, or shastras, wrap the exact canonical reference in citation tags: <cite canonicalRef="CANONICAL_REF">Reference Name</cite> (e.g. <cite canonicalRef="BG 2.47">BG 2.47</cite>).\n` +
    `- Do NOT invent fake shastras or fabricated verse citations. Ground your guidance in verified classical traditions.\n` +
    versesContext
  );
}

/**
 * Extracts citations from generated response text wrapped in <cite canonicalRef="...">...</cite> tags.
 */
export function extractCitations(
  text: string,
  availableVerses: WisdomVerseDTO[] = []
): MessageCitation[] {
  const citations: MessageCitation[] = [];
  const regex = /<cite\s+canonicalRef="([^"]+)">([^<]+)<\/cite>/g;
  let match: RegExpExecArray | null;

  const seen = new Set<string>();

  while ((match = regex.exec(text)) !== null) {
    const canonicalRef = match[1].trim();
    if (seen.has(canonicalRef)) continue;
    seen.add(canonicalRef);

    const matchedVerse = availableVerses.find(
      (v) => v.canonicalReference.toLowerCase() === canonicalRef.toLowerCase()
    );

    citations.push({
      canonicalReference: canonicalRef,
      chunkText: matchedVerse?.englishTranslation || match[2].trim(),
      domain: matchedVerse?.domain || 'gita',
      sourceId: matchedVerse?.id,
      relevanceScore: 1.0,
    });
  }

  return citations;
}
