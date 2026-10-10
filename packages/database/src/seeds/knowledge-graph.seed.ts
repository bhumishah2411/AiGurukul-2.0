import { Model } from 'mongoose';
import { GraphEntityType, GraphRelationshipType } from '@ai-gurukul/types';

export interface SeedNode {
  slug: string;
  name: string;
  sanskritName?: string;
  entityType: GraphEntityType;
  summary: string;
  description: string;
  era?: string;
  primarySources: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface SeedEdge {
  sourceSlug: string;
  targetSlug: string;
  relationship: GraphRelationshipType;
  description?: string;
  sourceReference?: string;
  weight?: number;
}

export const CANONICAL_KNOWLEDGE_NODES: SeedNode[] = [
  // --- TRADITIONS (DARSHANAS & DISCIPLINES) ---
  {
    slug: 'advaita-vedanta',
    name: 'Advaita Vedanta',
    sanskritName: 'अद्वैत वेदान्त',
    entityType: 'tradition',
    summary:
      'The non-dualistic orthodox school positing that Atman (individual self) and Brahman (universal reality) are identical.',
    description:
      'Systematized masterfully by Adi Shankaracharya, Advaita Vedanta asserts that phenomenal diversity is an empirical appearance (Maya) superimposed upon pure, indivisible consciousness (Brahman).',
    era: 'c. 8th Century CE (Classical Synthesis)',
    primarySources: ['Brahma Sutras', 'Upanishads', 'Bhagavad Gita'],
    tags: ['vedanta', 'non-dualism', 'philosophy', 'orthodox', 'brahman'],
  },
  {
    slug: 'samkhya',
    name: 'Samkhya Darshana',
    sanskritName: 'सांख्य दर्शन',
    entityType: 'tradition',
    summary:
      'The classical dualistic realism distinguishing between pure witnessing consciousness (Purusha) and manifest matter (Prakriti).',
    description:
      'Founded by Sage Kapila, Samkhya is the cosmological backbone of classical Indian systems, explaining evolution through the interaction of Purusha, Prakriti, and the three Gunas.',
    era: 'c. 6th Century BCE',
    primarySources: ['Samkhya Karika', 'Samkhya Pravachana Sutra'],
    tags: ['cosmology', 'dualism', 'purusha-prakriti', 'metaphysics', 'gunas'],
  },
  {
    slug: 'yoga-darshana',
    name: 'Yoga Darshana',
    sanskritName: 'योग दर्शन',
    entityType: 'tradition',
    summary:
      'The practical experiential school dedicated to the stilling of mental fluctuations and realization of pure consciousness.',
    description:
      'Composed as an eightfold methodology (Ashtanga Yoga) by Patanjali, adopting Samkhya metaphysics while introducing Ishvara and rigorous psycho-spiritual discipline.',
    era: 'c. 2nd Century BCE - 4th Century CE',
    primarySources: ['Yoga Sutras of Patanjali', 'Vyasa Bhashya'],
    tags: ['meditation', 'psychology', 'ashtanga', 'chitta-vritti', 'samadhi'],
  },
  {
    slug: 'ayurveda',
    name: 'Ayurveda',
    sanskritName: 'आयुर्वेद',
    entityType: 'tradition',
    summary: 'The classical Upaveda of longevity, metabolic balance, and holistic medicine.',
    description:
      'Grounding diagnosis in the Tri-Doshas (Vata, Pitta, Kapha) and digestive fire (Agni), Ayurveda harmonizes physical constitution (Prakriti) with daily and seasonal living.',
    era: 'c. 1000 BCE - 500 CE',
    primarySources: ['Charaka Samhita', 'Sushruta Samhita', 'Ashtanga Hridaya'],
    tags: ['medicine', 'doshas', 'health', 'wellness', 'longevity', 'agni'],
  },
  {
    slug: 'arthashastra-tradition',
    name: 'Arthashastra Tradition',
    sanskritName: 'अर्थशास्त्र',
    entityType: 'tradition',
    summary:
      'Classical Indian political science, strategic diplomacy, statecraft, and economic governance.',
    description:
      'Pioneered by Kautilya (Chanakya), articulating realpolitik, bureaucratic integrity, the Saptanga theory of state, and ethical state stewardship.',
    era: 'c. 4th Century BCE',
    primarySources: ['Kautilya Arthashastra', 'Chanakya Neeti'],
    tags: ['statecraft', 'governance', 'politics', 'leadership', 'economics'],
  },
  {
    slug: 'nyaya',
    name: 'Nyaya Darshana',
    sanskritName: 'न्याय दर्शन',
    entityType: 'tradition',
    summary: 'The school of logic, epistemology, and valid means of knowledge (Pramanas).',
    description:
      'Founded by Sage Akshapada Gautama, establishing the formal rules of debate, syllogism, perception, and inference utilized across all Indian philosophical traditions.',
    era: 'c. 2nd Century BCE',
    primarySources: ['Nyaya Sutras'],
    tags: ['logic', 'epistemology', 'pramana', 'debate', 'rationalism'],
  },

  // --- CANONICAL TEXTS ---
  {
    slug: 'bhagavad-gita',
    name: 'Bhagavad Gita',
    sanskritName: 'श्रीमद्भगवद्गीता',
    entityType: 'text',
    summary:
      'The 700-verse dialogue between Sri Krishna and Arjuna on the battlefield of Kurukshetra.',
    description:
      'An integral synthesis of Karma Yoga, Jnana Yoga, and Bhakti Yoga, addressing existential doubt, righteous action without attachment, and the nature of the Supreme Self.',
    era: 'c. 5th - 2nd Century BCE',
    primarySources: ['Mahabharata Bhishma Parva 23-40'],
    tags: ['gita', 'smriti', 'krishna', 'karma-yoga', 'dharma', 'scripture'],
  },
  {
    slug: 'upanishads',
    name: 'Principal Upanishads',
    sanskritName: 'उपनिषदः',
    entityType: 'text',
    summary:
      'The concluding philosophical portion of the Vedas (Vedanta), elucidating the ultimate nature of Atman and Brahman.',
    description:
      'Classical dialogues between illumined teachers and seekers exploring the nature of reality, death, consciousness, and transcendence (e.g. Katha, Chandogya, Mandukya, Isha).',
    era: 'c. 800 - 500 BCE',
    primarySources: ['Katha Upanishad', 'Isha Upanishad', 'Mandukya Upanishad'],
    tags: ['shruti', 'vedas', 'vedanta', 'consciousness', 'mysticism'],
  },
  {
    slug: 'yoga-sutras',
    name: 'Yoga Sutras of Patanjali',
    sanskritName: 'पातञ्जलयोगसूत्राणि',
    entityType: 'text',
    summary:
      '196 aphorisms delineating the psychological and spiritual mechanics of classical Raja Yoga.',
    description:
      'Divided into four padas (Samadhi, Sadhana, Vibhuti, Kaivalya), systematizing ethics (Yama/Niyama), posture, breathwork, and deep absorptive meditation.',
    era: 'c. 400 CE',
    primarySources: ['Yoga Sutras 1.1 - 4.34'],
    tags: ['yoga', 'meditation', 'sutras', 'patanjali', 'mind-control'],
  },
  {
    slug: 'charaka-samhita',
    name: 'Charaka Samhita',
    sanskritName: 'चरकसंहिता',
    entityType: 'text',
    summary:
      'The principal foundational Sanskrit compendium of classical internal medicine (Kaya Chikitsa).',
    description:
      'Authored by Sage Agnivesha and redacted by Charaka, detailing anatomy, pathology, dietetics, doshic diagnostics, and pharmacological formulations.',
    era: 'c. 2nd Century BCE - 2nd Century CE',
    primarySources: ['Charaka Samhita Sutrasthana', 'Chikitsasthana'],
    tags: ['ayurveda', 'medicine', 'charaka', 'healing', 'dinacharya', 'ahara'],
  },
  {
    slug: 'arthashastra-text',
    name: 'Kautilya Arthashastra',
    sanskritName: 'कौटिलीयम् अर्थशास्त्रम्',
    entityType: 'text',
    summary:
      'The exhaustive ancient Sanskrit manual on statecraft, espionage, military strategy, and civic law.',
    description:
      'Composed by Chanakya (Vishnugupta), detailing institutional governance, treasury management, taxation, and inter-state relations.',
    era: 'c. 4th Century BCE',
    primarySources: ['Arthashastra Adhikaranas 1-15'],
    tags: ['politics', 'chanakya', 'law', 'diplomacy', 'governance'],
  },
  {
    slug: 'samkhya-karika',
    name: 'Samkhya Karika',
    sanskritName: 'सांख्यकारिका',
    entityType: 'text',
    summary:
      'The definitive surviving metrical exposition of classical Samkhya philosophy by Ishvarakrishna.',
    description:
      '72 verses delineating the 25 tattvas (principles of reality), the causal nature of Prakriti, and liberation through discriminative discernment.',
    era: 'c. 4th - 5th Century CE',
    primarySources: ['Samkhya Karika Verses 1-72'],
    tags: ['samkhya', 'tattvas', 'metaphysics', 'ishvarakrishna'],
  },

  // --- SAGES, AUTHORS & PRECEPTORS ---
  {
    slug: 'lord-krishna',
    name: 'Sri Krishna',
    sanskritName: 'श्रीकृष्ण',
    entityType: 'author',
    summary: 'The Supreme Yogeshvara and Divine Teacher of the Bhagavad Gita.',
    description:
      'Embodies transcendental compassion, practical leadership, selfless action, and spiritual liberation on the Kurukshetra battlefield.',
    era: 'Vedic / Mahabharata Era',
    primarySources: ['Bhagavad Gita', 'Mahabharata'],
    tags: ['avatar', 'guru', 'krishna', 'yogeshvara', 'dharma'],
  },
  {
    slug: 'veda-vyasa',
    name: 'Veda Vyasa',
    sanskritName: 'वेदव्यास',
    entityType: 'author',
    summary:
      'The revered sage Krishna Dvaipayana, compiler of the Vedas and composer of the Mahabharata.',
    description:
      'Central patriarch of Vedic literary preservation, credited with dividing the single primordial Veda into four and composing the 18 Puranas and Brahma Sutras.',
    era: 'Vedic Era',
    primarySources: ['Mahabharata', 'Brahma Sutras'],
    tags: ['rishi', 'compiler', 'vedas', 'mahabharata', 'author'],
  },
  {
    slug: 'adi-shankara',
    name: 'Adi Shankaracharya',
    sanskritName: 'आदि शङ्कराचार्य',
    entityType: 'author',
    summary:
      'The monumental exponent of Advaita Vedanta who unified Indian philosophical thought through rigorous commentary.',
    description:
      'Traversed the Indian subcontinent establishing four mathas, authoring definitive commentaries (Bhashyas) on the Prasthanatrayi.',
    era: 'c. 788 - 820 CE',
    primarySources: ['Vivekachudamani', 'Brahma Sutra Bhashya', 'Gita Bhashya'],
    tags: ['shankara', 'advaita', 'acharyas', 'philosopher', 'non-dualism'],
  },
  {
    slug: 'patanjali',
    name: 'Sage Patanjali',
    sanskritName: 'पतञ्जलि',
    entityType: 'author',
    summary:
      'The sage who codified the aphorisms of classical Yoga and traditional Sanskrit grammar.',
    description:
      'Synthesized contemplative and physiological meditative techniques into the four chapters of the Yoga Sutras.',
    era: 'c. 2nd Century BCE - 4th Century CE',
    primarySources: ['Yoga Sutras of Patanjali', 'Mahabhasya'],
    tags: ['patanjali', 'yoga', 'sage', 'rishi', 'grammarian'],
  },
  {
    slug: 'vaidya-charaka',
    name: 'Vaidya Charaka',
    sanskritName: 'चरक',
    entityType: 'author',
    summary: 'The master physician and philosopher of the Charaka school of Ayurveda.',
    description:
      'Renowned for redacting the foundational medical text and synthesizing holistic clinical diagnostics with ethical lifestyle living.',
    era: 'c. 300 - 200 BCE',
    primarySources: ['Charaka Samhita'],
    tags: ['ayurveda', 'physician', 'medicine', 'healer', 'sage'],
  },
  {
    slug: 'chanakya',
    name: 'Chanakya Pandit (Kautilya)',
    sanskritName: 'चाणक्य',
    entityType: 'author',
    summary: 'The royal advisor to Chandragupta Maurya and architect of the Mauryan Empire.',
    description:
      'Master of strategic statecraft, intelligence, civic discipline, and governance; author of the Arthashastra and Chanakya Neeti.',
    era: 'c. 375 - 283 BCE',
    primarySources: ['Arthashastra', 'Chanakya Neeti'],
    tags: ['statesman', 'philosopher', 'chanakya', 'strategist', 'economist'],
  },
  {
    slug: 'sage-kapila',
    name: 'Sage Kapila',
    sanskritName: 'कपिल',
    entityType: 'author',
    summary: 'The primordial Vedic sage who first articulated the analytical dualism of Samkhya.',
    description:
      'Revered in the Upanishads, Gita, and Bhagavata Purana as the first teacher of analytical metaphysics and discriminative knowledge.',
    era: 'c. 6th Century BCE',
    primarySources: ['Samkhya Sutras', 'Bhagavata Purana 3.25-33'],
    tags: ['kapila', 'samkhya', 'sage', 'rishi', 'originator'],
  },

  // --- CORE PHILOSOPHICAL CONCEPTS ---
  {
    slug: 'dharma',
    name: 'Dharma',
    sanskritName: 'धर्म',
    entityType: 'concept',
    summary:
      'Cosmic order, righteous conduct, moral duty, and the sustaining foundation of existence.',
    description:
      'Derived from the root "dhr" (to uphold or sustain). Dharma spans individual righteousness (Svadharma), societal ethics, and the metaphysical harmony of the cosmos.',
    primarySources: ['BG 2.31', 'Manusmriti 2.6', 'Mahabharata Shantiparva'],
    tags: ['duty', 'ethics', 'cosmic-order', ' righteousness', 'core-concept'],
  },
  {
    slug: 'karma',
    name: 'Karma',
    sanskritName: 'कर्म',
    entityType: 'concept',
    summary:
      'The universal principle of cause and effect governing all deliberate intentional actions.',
    description:
      'Every thought and action generates subtle impressions (Samskaras) that inevitably mature into corresponding experiential consequences.',
    primarySources: ['Brihadaranyaka Upanishad 4.4.5', 'BG 3.8-9'],
    tags: ['cause-and-effect', 'action', 'destiny', 'core-concept'],
  },
  {
    slug: 'moksha',
    name: 'Moksha',
    sanskritName: 'मोक्ष',
    entityType: 'concept',
    summary: 'Spiritual liberation from the cycle of birth, death, and ignorance (Samsara).',
    description:
      'The supreme human goal (Parama Purushartha). Realized when false identification with the transient ego dissolves into direct experiential knowledge of the Self.',
    primarySources: ['Katha Upanishad 2.3.14', 'BG 18.66'],
    tags: ['liberation', 'enlightenment', 'purushartha', 'freedom', 'supreme-goal'],
  },
  {
    slug: 'atman',
    name: 'Atman',
    sanskritName: 'आत्मन्',
    entityType: 'concept',
    summary:
      'The eternal, immutable, self-luminous witnessing consciousness within all sentient beings.',
    description:
      'Unlike the temporary physical body and oscillating mind, the Atman is unborn, undying, and identical with the ultimate reality in Vedanta.',
    primarySources: ['BG 2.20', 'Mandukya Upanishad 2'],
    tags: ['self', 'soul', 'consciousness', 'witness', 'vedanta'],
  },
  {
    slug: 'brahman',
    name: 'Brahman',
    sanskritName: 'ब्रह्मन्',
    entityType: 'concept',
    summary: 'The infinite, omnipresent, non-dual substratum of all existence in Vedic philosophy.',
    description:
      'Described as Sat-Chit-Ananda (Existence-Consciousness-Bliss). Transcends name, form, and empirical categorization.',
    primarySources: ['Taittiriya Upanishad 2.1.1', 'Chandogya Upanishad 3.14.1'],
    tags: ['absolute', 'godhead', 'non-dualism', 'infinity', 'vedanta'],
  },
  {
    slug: 'prakriti',
    name: 'Prakriti',
    sanskritName: 'प्रकृति',
    entityType: 'concept',
    summary:
      'Primordial, unmanifest nature and the dynamic material matrix from which the universe evolves.',
    description:
      'Composed of the three Gunas (Sattva, Rajas, Tamas). In Samkhya and Ayurveda, it is the root of bodily constitution, intellect, ego, and sensory elements.',
    primarySources: ['Samkhya Karika 3', 'BG 13.19-20'],
    tags: ['nature', 'matter', 'evolution', 'matrix', 'samkhya'],
  },
  {
    slug: 'purusha',
    name: 'Purusha',
    sanskritName: 'पुरुष',
    entityType: 'concept',
    summary: 'Pure, transcendent, non-material witnessing consciousness in Samkhya and Yoga.',
    description:
      'The unattached observer that illuminates the activities of Prakriti without itself acting, changing, or degenerating.',
    primarySources: ['Samkhya Karika 17-19', 'Rigveda 10.90'],
    tags: ['consciousness', 'witness', 'spirit', 'samkhya', 'yoga'],
  },
  {
    slug: 'maya',
    name: 'Maya',
    sanskritName: 'माया',
    entityType: 'concept',
    summary:
      'The cosmic illusory power that projects phenomenal multiplicity over the non-dual Brahman.',
    description:
      'Possesses two distinct powers: Avarana Shakti (veiling the true Self) and Vikshepa Shakti (projecting the manifest appearance of plurality).',
    primarySources: ['Shvetashvatara Upanishad 4.10', 'BG 7.14'],
    tags: ['illusion', 'projection', 'cosmic-power', 'advaita'],
  },
  {
    slug: 'nishkama-karma',
    name: 'Nishkama Karma',
    sanskritName: 'निष्काम कर्म',
    entityType: 'practice',
    summary:
      'Selfless action dedicated to duty without attachment or anxiety regarding fruits and rewards.',
    description:
      'The core practical teaching of Sri Krishna in the Bhagavad Gita, transmuting worldly labor into spiritual liberation and mental equanimity.',
    primarySources: ['BG 2.47', 'BG 3.19'],
    tags: ['karma-yoga', 'duty', 'detachment', 'selflessness', 'gita'],
  },
  {
    slug: 'triguna',
    name: 'Triguna (Sattva, Rajas, Tamas)',
    sanskritName: 'त्रिगुण',
    entityType: 'concept',
    summary:
      'The three fundamental primal qualities interwoven through all physical and mental phenomena.',
    description:
      'Sattva represents clarity and harmony; Rajas represents passion, agitation, and movement; Tamas represents inertia, darkness, and stagnation.',
    primarySources: ['BG 14.5-18', 'Samkhya Karika 12-13'],
    tags: ['gunas', 'sattva', 'rajas', 'tamas', 'psychology', 'nature'],
  },
  {
    slug: 'chitta-vritti-nirodha',
    name: 'Chitta Vritti Nirodha',
    sanskritName: 'चित्तवृत्तिनिरोध',
    entityType: 'practice',
    summary: 'The cessation and intentional stilling of the turbulent modifications of the mind.',
    description:
      'The foundational definition of Yoga in Patanjali Yoga Sutra 1.2: "Yogaś citta-vṛtti-nirodhaḥ", revealing the Seer established in its true nature.',
    primarySources: ['Yoga Sutras 1.2 - 1.3'],
    tags: ['yoga', 'mind-control', 'stilling', 'meditation', 'samadhi'],
  },
  {
    slug: 'ashtanga-yoga',
    name: 'Ashtanga Yoga (Eight Limbs)',
    sanskritName: 'अष्टाङ्गयोग',
    entityType: 'practice',
    summary:
      'The eightfold classical path of Patanjali leading from ethical restraints to supreme meditative absorption.',
    description:
      'Consists of Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, and Samadhi.',
    primarySources: ['Yoga Sutras 2.29'],
    tags: ['eight-limbs', 'ashtanga', 'discipline', 'yama-niyama', 'pranayama'],
  },
  {
    slug: 'doshas',
    name: 'Tri-Dosha (Vata, Pitta, Kapha)',
    sanskritName: 'त्रिदोष',
    entityType: 'concept',
    summary:
      'The three constitutional biological energies governing human physiology and psychology in Ayurveda.',
    description:
      'Vata (Air/Space) governs movement; Pitta (Fire/Water) governs transformation and metabolism; Kapha (Earth/Water) governs lubrication and structure.',
    primarySources: ['Charaka Samhita Sutrasthana 1.57'],
    tags: ['ayurveda', 'vata', 'pitta', 'kapha', 'doshas', 'health'],
  },
  {
    slug: 'agni',
    name: 'Agni (Digestive Fire)',
    sanskritName: 'अग्नि',
    entityType: 'concept',
    summary:
      'The sacred biological and metaphysical fire responsible for digestion, assimilation, and metabolic transformation.',
    description:
      'In Ayurveda, healthy Agni is the primary determinant of immunity (Ojas), longevity, and the prevention of toxic waste (Ama).',
    primarySources: ['Charaka Samhita Chikitsasthana 15.3-4'],
    tags: ['metabolism', 'digestion', 'ayurveda', 'vitality', 'fire'],
  },
  {
    slug: 'ahara',
    name: 'Ahara (Nourishment & Dietetics)',
    sanskritName: 'आहार',
    entityType: 'practice',
    summary: 'Conscious, seasonal, and constitutional nutrition as the foundation of medicine.',
    description:
      'Regarded as one of the three pillars of life (Trayopastambha) in Ayurveda; when diet is balanced, medicine is rarely needed.',
    primarySources: ['Charaka Samhita Sutrasthana 28.34'],
    tags: ['diet', 'nutrition', 'ayurveda', 'healing', 'dinacharya'],
  },
  {
    slug: 'danda-neeti',
    name: 'Danda Neeti (Rule of Law & Deterrence)',
    sanskritName: 'दण्डनीति',
    entityType: 'concept',
    summary:
      'The doctrine of righteous coercive authority and deterrence upholding social harmony.',
    description:
      'In Chanakya statecraft, judicious enforcement of law prevents the law of the fish (Matsya Nyaya, where the strong devour the weak).',
    primarySources: ['Arthashastra 1.4.3', 'Mahabharata Shantiparva 15'],
    tags: ['governance', 'law', 'justice', 'statecraft', 'chanakya'],
  },
];

export const CANONICAL_KNOWLEDGE_EDGES: SeedEdge[] = [
  // --- TEXT AUTHORSHIP & AFFILIATIONS ---
  {
    sourceSlug: 'bhagavad-gita',
    targetSlug: 'veda-vyasa',
    relationship: 'authored_by',
    description: 'Compiled and recorded as an integral portion of the Mahabharata by Veda Vyasa.',
    sourceReference: 'Mahabharata',
    weight: 10,
  },
  {
    sourceSlug: 'bhagavad-gita',
    targetSlug: 'lord-krishna',
    relationship: 'expounds',
    description: 'Spoken directly by Sri Krishna as divine counsel to Arjuna.',
    sourceReference: 'BG 1.1 - 18.78',
    weight: 10,
  },
  {
    sourceSlug: 'yoga-sutras',
    targetSlug: 'patanjali',
    relationship: 'authored_by',
    description: 'Composed by Sage Patanjali as an authoritative manual of Raja Yoga.',
    sourceReference: 'YS 1.1',
    weight: 10,
  },
  {
    sourceSlug: 'charaka-samhita',
    targetSlug: 'vaidya-charaka',
    relationship: 'authored_by',
    description:
      'Redacted and expanded by Master Charaka as the primary compendium of Kaya Chikitsa.',
    sourceReference: 'CS Sutrasthana 1',
    weight: 10,
  },
  {
    sourceSlug: 'arthashastra-text',
    targetSlug: 'chanakya',
    relationship: 'authored_by',
    description:
      'Authored by Kautilya (Chanakya) as an institutional blueprint for imperial governance.',
    sourceReference: 'Arthashastra 1.1',
    weight: 10,
  },
  {
    sourceSlug: 'samkhya-karika',
    targetSlug: 'samkhya',
    relationship: 'expounds',
    description: 'Definitive surviving exposition of classical Samkhya dualism.',
    sourceReference: 'Verses 1-72',
    weight: 9,
  },
  {
    sourceSlug: 'sage-kapila',
    targetSlug: 'samkhya',
    relationship: 'affiliated_with',
    description: 'Revered as the primordial sage and originator of Samkhya philosophy.',
    sourceReference: 'Shvetashvatara Upanishad 5.2',
    weight: 9,
  },
  {
    sourceSlug: 'adi-shankara',
    targetSlug: 'advaita-vedanta',
    relationship: 'affiliated_with',
    description: 'Primary acharya and systematizer of the classical Advaita Vedanta tradition.',
    sourceReference: 'Brahma Sutra Bhashya',
    weight: 10,
  },

  // --- TRADITION PHILOSOPHICAL INFLUENCES & CRITIQUES ---
  {
    sourceSlug: 'samkhya',
    targetSlug: 'yoga-darshana',
    relationship: 'influences',
    description: 'Provides the cosmological and metaphysical scaffold adopted by Patanjali Yoga.',
    sourceReference: 'Vyasa Bhashya',
    weight: 9,
  },
  {
    sourceSlug: 'samkhya',
    targetSlug: 'ayurveda',
    relationship: 'influences',
    description:
      'Supplies the cosmological doctrine of Prakriti, Mahat, and Triguna underpinning Ayurvedic diagnostics.',
    sourceReference: 'Charaka Samhita Sharirasthana 1',
    weight: 9,
  },
  {
    sourceSlug: 'advaita-vedanta',
    targetSlug: 'samkhya',
    relationship: 'critiques',
    description:
      'Critiques Samkhya dualism, arguing that Prakriti cannot evolve independently without conscious non-dual Brahman.',
    sourceReference: 'Brahma Sutra Bhashya 2.2.1',
    weight: 8,
  },
  {
    sourceSlug: 'nyaya',
    targetSlug: 'advaita-vedanta',
    relationship: 'influences',
    description:
      'Supplies the formal epistemological debate framework and rules of Pramana utilized in Vedantic dialectics.',
    sourceReference: 'Nyaya Sutras 1.1',
    weight: 7,
  },

  // --- CONCEPTUAL DOCTRINAL EXPOSITIONS ---
  {
    sourceSlug: 'bhagavad-gita',
    targetSlug: 'nishkama-karma',
    relationship: 'expounds',
    description: 'Teaches selfless dedicated action without anxiety over the fruits.',
    sourceReference: 'BG 2.47',
    weight: 10,
  },
  {
    sourceSlug: 'bhagavad-gita',
    targetSlug: 'dharma',
    relationship: 'expounds',
    description: 'Explores the moral crisis of Svadharma versus emotional attachment.',
    sourceReference: 'BG 2.31',
    weight: 10,
  },
  {
    sourceSlug: 'bhagavad-gita',
    targetSlug: 'atman',
    relationship: 'expounds',
    description: 'Reveals the immortal, indestructible nature of the inner soul.',
    sourceReference: 'BG 2.11-25',
    weight: 9,
  },
  {
    sourceSlug: 'bhagavad-gita',
    targetSlug: 'triguna',
    relationship: 'expounds',
    description:
      'Classifies diet, faith, intellect, and action into Sattva, Rajas, and Tamas in Chapter 14 & 17.',
    sourceReference: 'BG 14.5-18',
    weight: 9,
  },
  {
    sourceSlug: 'upanishads',
    targetSlug: 'brahman',
    relationship: 'expounds',
    description: 'Declares Brahman as the supreme non-dual essence ("Sarvam Khalvidam Brahma").',
    sourceReference: 'Chandogya Upanishad 3.14.1',
    weight: 10,
  },
  {
    sourceSlug: 'upanishads',
    targetSlug: 'atman',
    relationship: 'expounds',
    description: 'Proclaims the identity of Atman with Brahman in the Great Mahavakyas.',
    sourceReference: 'Mandukya Upanishad 2',
    weight: 10,
  },
  {
    sourceSlug: 'upanishads',
    targetSlug: 'moksha',
    relationship: 'expounds',
    description:
      'Identifies liberation as the transcendence of mortality through direct Self-knowledge.',
    sourceReference: 'Katha Upanishad 2.3.14',
    weight: 9,
  },
  {
    sourceSlug: 'yoga-sutras',
    targetSlug: 'chitta-vritti-nirodha',
    relationship: 'expounds',
    description: 'Defines the essential objective of Yoga as the stilling of mental vortexes.',
    sourceReference: 'YS 1.2',
    weight: 10,
  },
  {
    sourceSlug: 'yoga-sutras',
    targetSlug: 'ashtanga-yoga',
    relationship: 'expounds',
    description: 'Delineates the eight progressive limbs from Yama to Samadhi.',
    sourceReference: 'YS 2.29',
    weight: 10,
  },
  {
    sourceSlug: 'charaka-samhita',
    targetSlug: 'doshas',
    relationship: 'expounds',
    description: 'Articulates the balance and vitiation of Vata, Pitta, and Kapha.',
    sourceReference: 'CS Sutrasthana 1.57',
    weight: 10,
  },
  {
    sourceSlug: 'charaka-samhita',
    targetSlug: 'agni',
    relationship: 'expounds',
    description: 'Establishes digestive fire as the master regulator of health and longevity.',
    sourceReference: 'CS Chikitsasthana 15',
    weight: 9,
  },
  {
    sourceSlug: 'charaka-samhita',
    targetSlug: 'ahara',
    relationship: 'expounds',
    description: 'Presents constitutional eating as the foremost medicine for human vitality.',
    sourceReference: 'CS Sutrasthana 28.34',
    weight: 9,
  },
  {
    sourceSlug: 'arthashastra-text',
    targetSlug: 'danda-neeti',
    relationship: 'expounds',
    description:
      'Codifies principled enforcement to maintain social order and prevent lawlessness.',
    sourceReference: 'Arthashastra 1.4',
    weight: 10,
  },
  {
    sourceSlug: 'samkhya',
    targetSlug: 'purusha',
    relationship: 'expounds',
    description: 'Isolates the passive witnessing consciousness from all material modifications.',
    sourceReference: 'Samkhya Karika 17',
    weight: 10,
  },
  {
    sourceSlug: 'samkhya',
    targetSlug: 'prakriti',
    relationship: 'expounds',
    description: 'Describes the evolutionary unfolding of nature through 24 cosmic principles.',
    sourceReference: 'Samkhya Karika 3',
    weight: 10,
  },
  {
    sourceSlug: 'advaita-vedanta',
    targetSlug: 'maya',
    relationship: 'expounds',
    description: 'Explains apparent cosmic plurality as a superimposition on non-dual Brahman.',
    sourceReference: 'Vivekachudamani 108',
    weight: 9,
  },

  // --- CONCEPTUAL RELATIONSHIPS & BRIDGES ---
  {
    sourceSlug: 'nishkama-karma',
    targetSlug: 'karma',
    relationship: 'part_of',
    description: 'The sublime spiritualized application of action without egoic craving.',
    sourceReference: 'BG 3.19',
    weight: 8,
  },
  {
    sourceSlug: 'dharma',
    targetSlug: 'karma',
    relationship: 'related_to',
    description: 'Dharma guides righteous intention; Karma enforces its ethical maturation.',
    sourceReference: 'Mahabharata Shantiparva',
    weight: 8,
  },
  {
    sourceSlug: 'karma',
    targetSlug: 'moksha',
    relationship: 'influences',
    description: 'Exhaustion of karmic bondage through knowledge unlocks supreme liberation.',
    sourceReference: 'BG 4.37',
    weight: 8,
  },
  {
    sourceSlug: 'dharma',
    targetSlug: 'moksha',
    relationship: 'influences',
    description: 'Righteous living purifies the mind, making it receptive to Self-liberation.',
    sourceReference: 'Manusmriti 12.106',
    weight: 8,
  },
  {
    sourceSlug: 'atman',
    targetSlug: 'brahman',
    relationship: 'related_to',
    description:
      'In Advaita Vedanta, the individual Self (Atman) and universal reality (Brahman) are non-different.',
    sourceReference: 'Chandogya Upanishad 6.8.7 (Tat Tvam Asi)',
    weight: 10,
  },
  {
    sourceSlug: 'triguna',
    targetSlug: 'prakriti',
    relationship: 'part_of',
    description: 'The three Gunas are the interwoven strands constituting Prakriti.',
    sourceReference: 'Samkhya Karika 12',
    weight: 9,
  },
  {
    sourceSlug: 'triguna',
    targetSlug: 'doshas',
    relationship: 'influences',
    description: 'The physical doshas reflect the psychological predominance of the Gunas.',
    sourceReference: 'Charaka Samhita Sharirasthana 4',
    weight: 8,
  },
  {
    sourceSlug: 'ashtanga-yoga',
    targetSlug: 'chitta-vritti-nirodha',
    relationship: 'influences',
    description: 'The eight limbs methodically dismantle mental turbulence to achieve stillness.',
    sourceReference: 'Yoga Sutras 2.28',
    weight: 9,
  },
  {
    sourceSlug: 'ahara',
    targetSlug: 'agni',
    relationship: 'influences',
    description: 'Nutritional qualities directly modulate and kindle the digestive fire.',
    sourceReference: 'Charaka Samhita Chikitsasthana 15.6',
    weight: 8,
  },
  {
    sourceSlug: 'agni',
    targetSlug: 'doshas',
    relationship: 'related_to',
    description:
      'Imbalance in Vata creates Vishamagni; Pitta creates Tikshnagni; Kapha creates Mandagni.',
    sourceReference: 'Charaka Samhita Sutrasthana 1',
    weight: 8,
  },
  {
    sourceSlug: 'danda-neeti',
    targetSlug: 'dharma',
    relationship: 'related_to',
    description: 'Righteous governance exists solely to protect and uphold societal Dharma.',
    sourceReference: 'Arthashastra 1.7',
    weight: 8,
  },
];

import { KnowledgeNodeModel } from '../models/knowledge-node.model.js';
import { KnowledgeEdgeModel } from '../models/knowledge-edge.model.js';

export async function seedCanonicalKnowledgeGraph(
  nodeModel: Model<any> = KnowledgeNodeModel,
  edgeModel: Model<any> = KnowledgeEdgeModel
): Promise<{ nodesSeeded: number; edgesSeeded: number }> {
  let nodesSeeded = 0;
  let edgesSeeded = 0;

  for (const node of CANONICAL_KNOWLEDGE_NODES) {
    const existing = await nodeModel.findOne({ slug: node.slug }).exec();
    if (!existing) {
      await nodeModel.create(node);
      nodesSeeded++;
    }
  }

  for (const edge of CANONICAL_KNOWLEDGE_EDGES) {
    const existing = await edgeModel
      .findOne({
        sourceSlug: edge.sourceSlug,
        targetSlug: edge.targetSlug,
        relationship: edge.relationship,
      })
      .exec();
    if (!existing) {
      await edgeModel.create(edge);
      edgesSeeded++;
    }
  }

  return { nodesSeeded, edgesSeeded };
}
