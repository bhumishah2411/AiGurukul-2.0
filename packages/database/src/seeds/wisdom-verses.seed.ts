import { WisdomDomain } from '@ai-gurukul/types';

export interface SeedVerse {
  domain: WisdomDomain;
  canonicalReference: string;
  sanskrit: string;
  transliteration: string;
  englishTranslation: string;
  commentary: string;
  themes: string[];
  speaker: string;
}

export const CANONICAL_SEED_VERSES: SeedVerse[] = [
  {
    domain: 'gita',
    canonicalReference: 'BG 2.47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration:
      'karmaṇy-evādhikāras te mā phaleṣu kadācana, mā karma-phala-hetur bhūr mā te saṅgo ’stv akarmaṇi',
    englishTranslation:
      'You have a right to perform your prescribed duties, but never to the fruits of your actions. Never consider yourself the cause of results, nor let yourself be attached to inaction.',
    commentary:
      'The foundational verse of Nishkama Karma (selfless action). Sri Krishna teaches Arjuna that mental peace and spiritual liberation arise when effort is decoupled from anxiety about rewards.',
    themes: ['duty', 'action', 'detachment', 'anxiety', 'karma-yoga'],
    speaker: 'Lord Krishna',
  },
  {
    domain: 'gita',
    canonicalReference: 'BG 2.11',
    sanskrit: 'अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः॥',
    transliteration:
      'aśocyān anvaśocas tvaṁ prajñā-vādāṁś ca bhāṣase, gatāsūn agatāsūṁś ca nānuśocanti paṇḍitāḥ',
    englishTranslation:
      'While speaking learned words, you are grieving for that which is not worthy of sorrow. The truly wise mourn neither for the living nor for the departed.',
    commentary:
      'Krishna reminds the sorrowful seeker of the eternal, imperishable nature of the soul (Atman) behind temporary physical vessels.',
    themes: ['grief', 'wisdom', 'mortality', 'equanimity'],
    speaker: 'Lord Krishna',
  },
  {
    domain: 'gita',
    canonicalReference: 'BG 6.5',
    sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    transliteration:
      'uddhared ātmanātmānaṁ nātmānam avasādayet, ātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ',
    englishTranslation:
      'Let a seeker elevate themselves through their own mind, and not degrade themselves. For the mind alone is the truest friend of the self, and the mind alone is the fiercest foe.',
    commentary:
      'Teaches radical self-accountability and mastery over mental fluctuations. An undisciplined mind behaves as an internal adversary; a disciplined mind is an ally.',
    themes: ['mindset', 'self-discipline', 'mental-health', 'inner-strength'],
    speaker: 'Lord Krishna',
  },
  {
    domain: 'chanakya',
    canonicalReference: 'Arthashastra 1.7.1',
    sanskrit: 'विद्या विनीतो राजा हि प्रजानां विनये रतः। अनन्यश्च श्रियं भुङ्क्ते सर्वभूतहिते रतः॥',
    transliteration:
      'vidyā-vinīto rājā hi prajānāṁ vinaye rataḥ, ananyaś ca śriyaṁ bhuṅkte sarva-bhūta-hite rataḥ',
    englishTranslation:
      'A leader who is trained in true knowledge, self-restrained, and devoted to the welfare of the people enjoys supreme prosperity and reigns without rival.',
    commentary:
      'Chanakya establishes ethical leadership: power is sustainable only when rooted in personal self-discipline (vinaya) and the tangible upliftment of those governed.',
    themes: ['leadership', 'governance', 'discipline', 'strategy'],
    speaker: 'Chanakya Pandit',
  },
  {
    domain: 'chanakya',
    canonicalReference: 'Chanakya Neeti 2.1',
    sanskrit: 'अधीत्येदं यथाशास्त्रं नरो जानाति सत्तमः। धर्मोपदेशविख्यातं कार्याकार्यं शुभाशुभम्॥',
    transliteration:
      'adhītyedaṁ yathā-śāstraṁ naro jānāti sattamaḥ, dharmopadeśa-vikhyātaṁ kāryākāryaṁ śubhāśubham',
    englishTranslation:
      'A person who carefully studies the shastras with discrimination gains clarity on what ought to be done and what ought not to be done, distinguishing true virtue from harmful paths.',
    commentary:
      'Emphasizes rigorous critical thinking, discernment (viveka), and strategic action over emotional impulsiveness.',
    themes: ['decision-making', 'discernment', 'ethics', 'pragmatism'],
    speaker: 'Chanakya Pandit',
  },
  {
    domain: 'ayurveda',
    canonicalReference: 'Charaka Samhita Sutrasthana 1.41',
    sanskrit: 'हिताहितं सुखं दुःखमायुस्तस्य हिताहितम्। मानं च तच्च यत्रोक्तमायुर्वेदः स उच्यते॥',
    transliteration:
      'hitāhitaṁ sukhaṁ duḥkham āyus tasya hitāhitam, mānaṁ ca tac ca yatroktam āyurvedaḥ sa ucyate',
    englishTranslation:
      'That science is called Ayurveda wherein wholesome and unwholesome, happy and unhappy lifespans are explained along with measures for longevity.',
    commentary:
      'Ayurveda is not merely a treatment for illness, but the science of living in alignment with nature, circadian rhythm, and individual biological constitution.',
    themes: ['vitality', 'wellness', 'holistic-health', 'doshas', 'longevity'],
    speaker: 'Vaidya Charaka',
  },
  {
    domain: 'upanishads',
    canonicalReference: 'Katha Upanishad 1.3.3',
    sanskrit: 'आत्मानं रथिनं विद्धि शरीरं रथमेव तु। बुद्धिं तु सारथिं विद्धि मनः प्रग्रहमेव च॥',
    transliteration:
      'ātmānaṁ rathinaṁ viddhi śarīraṁ ratham eva tu, buddhiṁ tu sārathiṁ viddhi manaḥ pragraham eva ca',
    englishTranslation:
      'Know the Self as the rider in the chariot, the body as the chariot itself, the intellect (buddhi) as the charioteer, and the mind as the reins.',
    commentary:
      'The classic Upanishadic chariot allegory illustrating how conscious intellect must gently steer sensory desires to maintain psychological harmony.',
    themes: ['consciousness', 'mind-control', 'self-realization', 'clarity'],
    speaker: 'Sage Yama',
  },
];

export async function seedCanonicalWisdom(
  verseModel: import('mongoose').Model<any>
): Promise<number> {
  let seededCount = 0;
  for (const v of CANONICAL_SEED_VERSES) {
    const existing = await verseModel.findOne({ canonicalReference: v.canonicalReference }).exec();
    if (!existing) {
      await verseModel.create(v);
      seededCount++;
    }
  }
  return seededCount;
}
