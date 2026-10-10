import { CreateQuizDTO } from '@ai-gurukul/types';

export const CANONICAL_SEED_QUIZZES: CreateQuizDTO[] = [
  {
    title: 'Bhagavad Gita: Fundamentals of Karma Yoga & Equanimity',
    description:
      'Explore core philosophical verses from the Bhagavad Gita on selfless action (Nishkama Karma), mastery of the senses, and cultivating peace of mind.',
    domain: 'gita',
    difficulty: 'beginner',
    tags: ['gita', 'karma-yoga', 'krishna', 'mind-control', 'dharma'],
    isActive: true,
    isDynamic: false,
    questions: [
      {
        questionText:
          'According to Bhagavad Gita 2.47 ("Karmanye vadhikaraste..."), what does Lord Krishna state that an individual has a rightful claim to?',
        options: [
          'The ultimate results and rewards of their action',
          'Only the execution of one’s duty or action, never the fruits',
          'Complete renunciation and inaction',
          'The praise and recognition of society',
        ],
        correctIndex: 1,
        explanation:
          'BG 2.47 establishes Nishkama Karma: "You have a right to perform your prescribed duty, but never to the fruits of action. Never consider yourself the cause of results, nor let yourself be attached to inaction."',
        sourceRef: 'Bhagavad Gita 2.47',
      },
      {
        questionText:
          'In Bhagavad Gita Chapter 2, verse 56, what is the term used for a person of steady, poised intellect who remains undisturbed by misery and free from craving?',
        options: ['Sthitaprajna', 'Brahmachari', 'Karmayogi', 'Tapasvi'],
        correctIndex: 0,
        explanation:
          'A "Sthitaprajna" (स्थितप्रज्ञ) is one whose intellect is steadfast, who is unaffected in adversity, free from attachment, fear, and anger (BG 2.56).',
        sourceRef: 'Bhagavad Gita 2.56',
      },
      {
        questionText:
          'According to Bhagavad Gita 6.5, how should a seeker uplift themselves, and what is described as both one’s greatest friend and greatest enemy?',
        options: [
          'Wealth and fortune',
          'One’s own disciplined or undisciplined mind',
          'External gurus alone',
          'Planetary alignments',
        ],
        correctIndex: 1,
        explanation:
          'BG 6.5 states: "One must elevate oneself by one’s own mind, not degrade oneself. For the mind is the friend of the conditioned soul, and the mind is also the enemy."',
        sourceRef: 'Bhagavad Gita 6.5',
      },
      {
        questionText:
          'What are the three Gunas (qualities of nature) expounded by Lord Krishna in Bhagavad Gita Chapter 14?',
        options: [
          'Vata, Pitta, and Kapha',
          'Sattva, Rajas, and Tamas',
          'Prana, Tejas, and Ojas',
          'Dharma, Artha, and Kama',
        ],
        correctIndex: 1,
        explanation:
          'The three fundamental Gunas are Sattva (illumination, harmony), Rajas (passion, activity), and Tamas (inertia, darkness).',
        sourceRef: 'Bhagavad Gita 14.5',
      },
      {
        questionText:
          'In BG 18.66 ("Sarva-dharman parityajya..."), what is Sri Krishna’s culminating instruction to Arjuna?',
        options: [
          'Retreat to the forest and cease all warfare',
          'Abandon all subordinate dogmas and surrender fully unto the Supreme Divine',
          'Rule Hastinapura with absolute ruthlessness',
          'Fast for forty days in solitary meditation',
        ],
        correctIndex: 1,
        explanation:
          'BG 18.66 represents the Charama Shloka: "Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve."',
        sourceRef: 'Bhagavad Gita 18.66',
      },
    ],
  },
  {
    title: 'Chanakya Niti: Strategic Leadership, Prudence & Statecraft',
    description:
      'Test your comprehension of Acharya Chanakya’s pragmatic wisdom from Arthashastra and Chanakya Neeti regarding friendship, vigilance, and statecraft.',
    domain: 'chanakya',
    difficulty: 'intermediate',
    tags: ['chanakya', 'neeti', 'arthashastra', 'leadership', 'strategy'],
    isActive: true,
    isDynamic: false,
    questions: [
      {
        questionText:
          'According to Chanakya Neeti, who should be tested during times of adversity and distress?',
        options: [
          'Only public officials',
          'Friends, servants, and relatives',
          'Enemies exclusively',
          'Astrologers',
        ],
        correctIndex: 1,
        explanation:
          'Chanakya notes: "Test a servant in the performance of duty, a relative in difficulty, a friend in adversity, and a wife in misfortune."',
        sourceRef: 'Chanakya Neeti 1.12',
      },
      {
        questionText:
          'In the Saptanga theory of statecraft in Arthashastra, which element represents the king or sovereign ruler as the focal head of state?',
        options: ['Amatya', 'Swami', 'Janapada', 'Danda'],
        correctIndex: 1,
        explanation:
          'The Swami (the king/leader) is the first and apex organ of the Saptanga (seven limbs) state model expounded by Kautilya.',
        sourceRef: 'Kautilya Arthashastra 6.1.1',
      },
      {
        questionText:
          'What warning does Chanakya give about excessive straightforwardness and honesty in a deceptive world?',
        options: [
          'Straight trees in a forest are cut down first, while crooked trees survive',
          'Honesty is always universally rewarded by foes',
          'Silence is worse than deceit',
          'Only wealthy individuals should speak truth',
        ],
        correctIndex: 0,
        explanation:
          'Chanakya remarks: "Do not be too straightforward. Go and see the forest; straight trees are felled first, while crooked ones remain standing."',
        sourceRef: 'Chanakya Neeti 7.12',
      },
      {
        questionText:
          'According to Chanakya, what is considered the greatest treasure that thieves cannot steal and fire cannot burn?',
        options: [
          'Gold and diamonds',
          'Fortified land',
          'Vidya (Knowledge/Learning)',
          'A mighty army',
        ],
        correctIndex: 2,
        explanation:
          'Vidya (knowledge) is heralded as the imperishable ornament and supreme wealth that increases by sharing and can never be plundered.',
        sourceRef: 'Chanakya Neeti 4.3',
      },
    ],
  },
  {
    title: 'Ayurveda Fundamentals: Tridosha, Dincharya & Agni',
    description:
      'Assess your knowledge of ancient classical healing from Charaka and Sushruta Samhitas, covering biological energies, digestive fire, and seasonal balance.',
    domain: 'ayurveda',
    difficulty: 'beginner',
    tags: ['ayurveda', 'dosha', 'charaka', 'agni', 'wellness'],
    isActive: true,
    isDynamic: false,
    questions: [
      {
        questionText:
          'Which Mahabhutas (great cosmic elements) primarily constitute the Vata dosha?',
        options: [
          'Earth (Prithvi) and Water (Jala)',
          'Air (Vayu) and Ether/Space (Akasha)',
          'Fire (Agni) and Water (Jala)',
          'Earth (Prithvi) and Fire (Agni)',
        ],
        correctIndex: 1,
        explanation:
          'Vata is formed from the combination of Air (Vayu) and Ether (Akasha), governing mobility, nervous impulses, and respiration.',
        sourceRef: 'Charaka Samhita Sutrasthana 1.59',
      },
      {
        questionText:
          'In Ayurveda, what is Jatharagni and why is its balance deemed crucial for life (Ayus)?',
        options: [
          'A type of herbal massage oil',
          'The central digestive and metabolic fire responsible for assimilation and vitality',
          'A seasonal breathing technique',
          'A pulse diagnosis pressure point',
        ],
        correctIndex: 1,
        explanation:
          'Charaka Samhita asserts "Rogah sarve api mande agnau" — all diseases stem from deranged or weak Agni (digestive fire), which leads to Ama (toxic residue).',
        sourceRef: 'Charaka Samhita Chikitsasthana 15.3',
      },
      {
        questionText:
          'What is "Brahma Muhurta", recommended in classical Dincharya (daily regimen) for optimal awakening and meditation?',
        options: [
          'High noon during solar zenith',
          'Approximately 1.5 hours before sunrise',
          'Midnight during lunar peak',
          'Immediately after sunset',
        ],
        correctIndex: 1,
        explanation:
          'Ashtanga Hridaya advises awakening in Brahma Muhurta (around 48 to 96 minutes before sunrise) when Sattva guna dominates the atmosphere.',
        sourceRef: 'Ashtanga Hridaya Sutrasthana 2.1',
      },
      {
        questionText:
          'Which of the following is an unctuous, cooling, and sweet herb revered in Ayurveda as a premier Rasayana for Pitta pacification and longevity?',
        options: ['Shatavari', 'Black Pepper (Maricha)', 'Dry Ginger (Shunti)', 'Mustard seeds'],
        correctIndex: 0,
        explanation:
          'Shatavari (Asparagus racemosus) is cooling (Sheeta virya), nourishing (Rasayana), and sweet (Madhura), exceptionally suited for soothing Pitta and Vata.',
        sourceRef: 'Charaka Samhita Sutrasthana 4.18',
      },
    ],
  },
  {
    title: 'Upanishadic Dialogues: The Immortal Atman & Ultimate Reality',
    description:
      'Ponder the profound metaphysical teachings of the Katha, Mandukya, and Chandogya Upanishads on consciousness, death, and Brahman.',
    domain: 'upanishads',
    difficulty: 'advanced',
    tags: ['upanishads', 'vedanta', 'atman', 'brahman', 'nachiketa'],
    isActive: true,
    isDynamic: false,
    questions: [
      {
        questionText:
          'In the Katha Upanishad, who is the young seeker who travels to the abode of Yama (the Lord of Death) to ask the third boon regarding life after death?',
        options: ['Svetaketu', 'Nachiketa', 'Satyakama Jabala', 'Yajnavalkya'],
        correctIndex: 1,
        explanation:
          'Nachiketa asks Yama to reveal the secret of the Self that transcends mortality, refusing worldly riches, kingdoms, and pleasures.',
        sourceRef: 'Katha Upanishad 1.1.20',
      },
      {
        questionText:
          'In the Mandukya Upanishad, the sacred syllable AUM (OM) is mapped onto three states of consciousness. What is the fourth, transcendent state beyond dualities?',
        options: [
          'Jagrat (Waking)',
          'Svapna (Dreaming)',
          'Sushupti (Deep Sleep)',
          'Turiya (The Fourth)',
        ],
        correctIndex: 3,
        explanation:
          'Turiya (तूरीय) is the silent fourth state: pure consciousness, non-dual, peaceful, auspicious (Shantam Shivam Advaitam).',
        sourceRef: 'Mandukya Upanishad 7',
      },
      {
        questionText:
          'Which renowned Mahavakya (great declaration) from the Chandogya Upanishad does Sage Uddalaka repeatedly teach his son Svetaketu?',
        options: [
          'Tat Tvam Asi ("Thou Art That")',
          'Aham Brahmasmi ("I am Brahman")',
          'Prajnanam Brahma ("Consciousness is Brahman")',
          'Ayam Atma Brahma ("This Self is Brahman")',
        ],
        correctIndex: 0,
        explanation:
          '"Tat Tvam Asi" (तत्त्वमसि) occurs in Chandogya Upanishad 6.8.7 as Uddalaka reveals the identity between the individual Self and the universal Ground of Being.',
        sourceRef: 'Chandogya Upanishad 6.8.7',
      },
      {
        questionText:
          'In the Brihadaranyaka Upanishad, which great philosopher sage engages in profound intellectual debate at King Janaka’s court against Gargi Vachaknavi?',
        options: ['Yajnavalkya', 'Vyasa', 'Kapila', 'Valmiki'],
        correctIndex: 0,
        explanation:
          'Sage Yajnavalkya eloquently responds to Gargi’s challenging questions regarding the warp and woof on which space itself is woven: the Imperishable (Akshara).',
        sourceRef: 'Brihadaranyaka Upanishad 3.8',
      },
    ],
  },
];

import { QuizModel } from '../models/quiz.model.js';

export async function seedCanonicalQuizzes(
  quizModel: import('mongoose').Model<any> = QuizModel
): Promise<number> {
  let seededCount = 0;
  for (const q of CANONICAL_SEED_QUIZZES) {
    const existing = await quizModel.findOne({ title: q.title }).exec();
    if (!existing) {
      await quizModel.create(q);
      seededCount++;
    }
  }
  return seededCount;
}
