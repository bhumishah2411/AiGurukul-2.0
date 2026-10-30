import {
  CreateQuizDTO,
  GenerateDynamicQuizInput,
  QuizAttemptDTO,
  QuizClientDTO,
  QuizDTO,
  QuizFilterParams,
  QuizQuestionDTO,
  QuizSummaryDTO,
  SubmitQuizAttemptInput,
  BadRequestError,
  NotFoundError,
  QuizDomain,
} from '@ai-gurukul/types';
import { QuizRepository } from '../repositories/quiz.repository.js';
import { QuizAttemptRepository } from '../repositories/quiz-attempt.repository.js';
import { AIProvider } from '@ai-gurukul/ai';
import mongoose, { Types } from 'mongoose';
import { RAGService } from './rag.service.js';
import { DocumentChunkModel } from '@ai-gurukul/database';

// Domain question repository for dynamic generation fallback (10+ authentic questions per domain)
const DYNAMIC_QUESTION_BANKS: Record<QuizDomain, QuizQuestionDTO[]> = {
  gita: [
    {
      questionText: 'According to Bhagavad Gita 2.47, what is the core doctrine of Nishkama Karma regarding human action?',
      options: [
        'Action performed with desire for heavenly rewards',
        'Action dedicated without selfish attachment to the outcome',
        'Renouncing all forms of work and living in isolation',
        'Performing action only under legal compulsion',
      ],
      correctIndex: 1,
      explanation:
        'BG 2.47 establishes the foundation of Karma Yoga: perform prescribed duties with excellence without selfish anxiety for outcomes.',
      sourceRef: 'Bhagavad Gita 2.47',
    },
    {
      questionText: 'In Chapter 2 of the Bhagavad Gita, how does Sri Krishna describe the soul (Atman)?',
      options: [
        'Subject to birth, decay, and death like the physical body',
        'Created at conception and destroyed at cremation',
        'Unborn, eternal, unslayable, and unchanging',
        'A temporary projection of material atoms',
      ],
      correctIndex: 2,
      explanation:
        'BG 2.20 states that the soul is never born, nor does it die at any time. It is unborn, eternal, ever-existing, and primeval.',
      sourceRef: 'Bhagavad Gita 2.20',
    },
    {
      questionText: 'What constitutes the "Yoga of Wisdom and Discernment" in the Gita?',
      options: ['Jnana Yoga', 'Bhakti Yoga', 'Hatha Yoga', 'Kriya Yoga'],
      correctIndex: 0,
      explanation:
        'Jnana Yoga is the path of philosophical enquiry and experiential insight into the nature of Brahman and Atman.',
      sourceRef: 'Bhagavad Gita Chapter 4',
    },
    {
      questionText: 'How does Krishna advise Arjuna to overcome grief and sorrow in battle?',
      options: [
        'By fleeing the battlefield to avoid violence',
        'By fixing the intellect on the imperishable Reality beyond bodily forms',
        'By taking vows of silence',
        'By consulting astrologers',
      ],
      correctIndex: 1,
      explanation:
        'Krishna points out that the wise mourn neither for the living nor the dead (BG 2.11) because the Atman is imperishable.',
      sourceRef: 'Bhagavad Gita 2.11',
    },
    {
      questionText: 'In Bhagavad Gita 2.56, how does Sri Krishna describe the disposition of a Sthitaprajna (sage of steady wisdom)?',
      options: [
        'One who fluctuates wildly between ecstatic triumph and deep despair',
        'One whose mind remains unperturbed in misery, devoid of craving in pleasure, and free from attachment, fear, and anger',
        'One who completely avoids all human relationships and social contact',
        'One who achieves inner balance solely through mechanical rituals',
      ],
      correctIndex: 1,
      explanation:
        'BG 2.56 defines Sthitaprajna as one whose intellect remains poised and undisturbed amid both adversity and pleasant circumstances.',
      sourceRef: 'Bhagavad Gita 2.56',
    },
    {
      questionText: 'In Bhagavad Gita 2.62-63, what is described as the destructive psychological chain originating from dwelling on sense objects?',
      options: [
        'Dwelling leads to attachment, attachment breeds desire, unfulfilled desire turns to anger, anger produces delusion, destroying intellect',
        'Dwelling brings immediate enlightenment and mental balance',
        'Attachment leads directly to physical fatigue while keeping the intellect clear',
        'Anger dissolves desire and restores peace',
      ],
      correctIndex: 0,
      explanation:
        'BG 2.62-63 details how sensual dwelling creates attachment, unfulfilled desire breeds wrath, wrath induces delusion, destroying discrimination.',
      sourceRef: 'Bhagavad Gita 2.62-63',
    },
    {
      questionText: 'Why does Sri Krishna declare in Bhagavad Gita 3.35 that one’s own duty (Svadharma) is superior to another’s (Paradharma)?',
      options: [
        'Another’s path carries no societal obligations',
        'Performing one’s own duty, even imperfectly, aligns with authentic nature, whereas adopting another’s path breeds fear and moral confusion',
        'One’s own duty always yields greater immediate material wealth',
        'Destruction while doing duty should be avoided by adopting easy tasks',
      ],
      correctIndex: 1,
      explanation:
        'BG 3.35 teaches that living authentically according to one’s own inner nature and duty (Svadharma) is far safer than imitating another’s role.',
      sourceRef: 'Bhagavad Gita 3.35',
    },
    {
      questionText: 'According to Bhagavad Gita 6.5, what role does one’s own mind play in personal elevation or downfall?',
      options: [
        'The mind has no influence on spiritual or psychological destiny',
        'The disciplined mind is one’s truest friend, while the undisciplined mind acts as one’s fiercest enemy',
        'External fate alone dictates success or downfall regardless of mind',
        'The mind is inherently corrupt and cannot be befriended',
      ],
      correctIndex: 1,
      explanation:
        'BG 6.5 teaches self-elevation: "Let a person lift themselves through their own mind... for the mind alone is friend, and mind alone is foe."',
      sourceRef: 'Bhagavad Gita 6.5',
    },
    {
      questionText: 'In Bhagavad Gita 3.21, why are leaders and influential persons exhorted to maintain rigorous personal ethics?',
      options: [
        'Because whatever standards a leader sets by action, ordinary people naturally follow as their standard',
        'To intimidate potential political rivals',
        'To evade tax obligations',
        'Because leaders have no personal responsibilities',
      ],
      correctIndex: 0,
      explanation:
        'BG 3.21 states: "Yad yad acharati shreshthas tat tad evetaro janah" — the general populace follows the moral and ethical standard set by leaders.',
      sourceRef: 'Bhagavad Gita 3.21',
    },
    {
      questionText: 'What is the supreme synthesis and refuge offered by Sri Krishna in Bhagavad Gita 18.66?',
      options: [
        'Abandoning all rigid egoic dogmas and taking refuge in the Supreme Truth and Grace alone',
        'Withdrawal from society into total ascetic isolation',
        'Pursuing military conquest for sovereign domination',
        'Relying solely on external ritual oblations',
      ],
      correctIndex: 0,
      explanation:
        'BG 18.66 represents the ultimate charama-shloka: surrender all anxiety and relative dogmas to Supreme Divinity, who liberates the soul from fear.',
      sourceRef: 'Bhagavad Gita 18.66',
    },
  ],
  chanakya: [
    {
      questionText: 'What is the primary aim of statecraft according to Kautilya in Arthashastra?',
      options: [
        'Personal enrichment of the king',
        'Yogakshema (welfare, security, and prosperity) of all subjects',
        'Destruction of all neighboring nations without cause',
        'Isolationism from world commerce',
      ],
      correctIndex: 1,
      explanation:
        'Arthashastra states: "Prajasukhe sukham rajnah prajanam cha hite hitam" — in the happiness and welfare of the subjects lies the king\'s true happiness.',
      sourceRef: 'Arthashastra 1.19.34',
    },
    {
      questionText: 'Which strategy in the Upayas (four expedients) involves negotiation and peaceful alliance?',
      options: ['Sama', 'Dana', 'Bheda', 'Danda'],
      correctIndex: 0,
      explanation:
        'Sama refers to peaceful persuasion, diplomacy, conciliation, and respectful dialogue.',
      sourceRef: 'Arthashastra 2.10',
    },
    {
      questionText: 'What does Chanakya warn regarding trusting an untrusted individual or excess trust in friends?',
      options: [
        'Blind trust without discernment can lead to complete ruin if an ally turns adverse',
        'One should trust everyone indiscriminately',
        'No contracts should ever be written down',
        'Friends never possess conflicting motives',
      ],
      correctIndex: 0,
      explanation:
        'Chanakya Neeti advises vigilance: "Never trust an untrustworthy person, and do not trust even a friend blindly; for when angry, an old friend may disclose all secrets."',
      sourceRef: 'Chanakya Neeti 2.6',
    },
    {
      questionText: 'According to Kautilya in Arthashastra 1.7.1, what essential character quality enables a leader to govern prosperously?',
      options: [
        'Ruthless domination of ministers through fear alone',
        'Disciplined self-restraint (Vinaya), mastery over senses, and active dedication to the welfare of all people',
        'Amassing personal wealth in private treasuries',
        'Remaining aloof and avoiding direct administrative accountability',
      ],
      correctIndex: 1,
      explanation:
        'Arthashastra 1.7.1 emphasizes that an educated, self-restrained ruler devoted to public good ("sarvabhūtahite rataḥ") enjoys enduring prosperity.',
      sourceRef: 'Arthashastra 1.7.1',
    },
    {
      questionText: 'In Arthashastra 1.9.1, how does Chanakya advise rulers to vet the integrity of ministers and close counselors?',
      options: [
        'Through structured secret tests (Upadhas) evaluating virtue, financial temptation, emotional allure, and courage under acute fear',
        'By accepting candidates purely based on hereditary family prestige',
        'By consulting court astrologers without practical observation',
        'By assuming all close associates are naturally incorruptible',
      ],
      correctIndex: 0,
      explanation:
        'Kautilya prescribes the four Upadhas (ethical, financial, sensual, and fear tests) before entrusting critical state responsibilities.',
      sourceRef: 'Arthashastra 1.9.1',
    },
    {
      questionText: 'In Chanakya Neeti 1.12, what acute situation is identified as the true test of genuine friendship and loyalty?',
      options: [
        'During times of lavish celebration and prosperity',
        'In times of disaster, adversity, and crisis (apatti-kale)',
        'When signing commercial contracts',
        'During formal public ceremonies',
      ],
      correctIndex: 1,
      explanation:
        'Chanakya Neeti 1.12 teaches: "Test servants in the discharge of duties, relatives in adversity, and friends in times of crisis."',
      sourceRef: 'Chanakya Neeti 1.12',
    },
    {
      questionText: 'What strategic counsel does Chanakya impart through the metaphor of straight and crooked trees in forest cutting?',
      options: [
        'Always reveal every vulnerability and intention openly to adversaries',
        'Straight trees in the forest are felled first; therefore maintain tactical prudence and self-preservation in untrustworthy company',
        'Defy all authority openly without preparation',
        'Flee to the forest whenever political disputes arise',
      ],
      correctIndex: 1,
      explanation:
        'Chanakya Neeti 2.8 warns that extreme naivety or excessive transparency in harsh environments invites exploitation; prudence is essential.',
      sourceRef: 'Chanakya Neeti 2.8',
    },
    {
      questionText: 'What are the Saptanga (Seven Limbs) of the state according to Arthashastra 6.1?',
      options: [
        'Swami (king), Amatya (ministers), Janapada (territory/people), Durga (fortress), Kosha (treasury), Danda (military/justice), and Mitra (allies)',
        'Earth, Water, Fire, Air, Space, Sun, and Moon',
        'Infantry, Cavalry, Chariots, Elephants, Navy, Spies, and Diplomats',
        'Brahma, Vishnu, Shiva, Indra, Varuna, Agni, and Yama',
      ],
      correctIndex: 0,
      explanation:
        'Arthashastra 6.1 outlines the organic structure of the sovereign state composed of 7 interdependent elements.',
      sourceRef: 'Arthashastra 6.1',
    },
    {
      questionText: 'What does Chanakya emphasize regarding the management of time (Kala) and procrastination?',
      options: [
        'A single moment lost cannot be bought back with millions of gold coins; hence unutilized time is the greatest loss',
        'Important duties should always be postponed until tomorrow',
        'Time flows backwards in statecraft',
        'Planning ahead is unnecessary if one is bold',
      ],
      correctIndex: 0,
      explanation:
        'Chanakya Neeti repeatedly asserts that time wasted can never be recouped; immediate disciplined execution is paramount.',
      sourceRef: 'Chanakya Neeti 3.12',
    },
    {
      questionText: 'In Arthashastra 1.4, why is Dandaniti (equitable justice and enforcement of law) considered the foundation of civilization?',
      options: [
        'Because without impartial justice, the law of the fish (Matsyanyaya) prevails, where the strong devour the weak',
        'To generate revenue through heavy fines',
        'To establish absolute tyranny over merchants',
        'To replace all trade and commerce with military orders',
      ],
      correctIndex: 0,
      explanation:
        'Kautilya asserts that just rule of law protects the weak and fosters prosperity, while arbitrary cruelty or absence of law breeds rebellion.',
      sourceRef: 'Arthashastra 1.4.13',
    },
  ],
  upanishads: [
    {
      questionText: 'What is the central ontological assertion of the Chandogya Upanishad\'s "Tat Tvam Asi"?',
      options: [
        'The individual self (Atman) is inherently non-different from ultimate reality (Brahman)',
        'The world is permanent and self-subsisting',
        'Ritual sacrifice alone yields salvation',
        'God resides only on distant mountains',
      ],
      correctIndex: 0,
      explanation:
        '"Tat Tvam Asi" (That Thou Art) is the Mahavakya of Chandogya Upanishad (6.8.7) asserting non-dual identity.',
      sourceRef: 'Chandogya Upanishad 6.8.7',
    },
    {
      questionText: 'In the Katha Upanishad, the human body is compared to what symbolic metaphor?',
      options: [
        'A lotus pond',
        'A chariot with horses and a charioteer',
        'A golden fortress',
        'A flowing river',
      ],
      correctIndex: 1,
      explanation:
        'Katha Upanishad 1.3.3 teaches: "Know the Self as the rider of the chariot, the body as the chariot, the intellect as the charioteer, and the mind as the reins."',
      sourceRef: 'Katha Upanishad 1.3.3',
    },
    {
      questionText: 'Which Upanishad opens with the famous proclamation "Isha vasyam idam sarvam"?',
      options: ['Isha Upanishad', 'Kena Upanishad', 'Prashna Upanishad', 'Taittiriya Upanishad'],
      correctIndex: 0,
      explanation:
        'The Isha Upanishad opens by stating that everything animate or inanimate within this universe is enveloped by the Divine.',
      sourceRef: 'Isha Upanishad 1',
    },
    {
      questionText: 'What famous prayer for liberation from ignorance and death originates in the Brihadaranyaka Upanishad?',
      options: [
        'Asato ma sadgamaya, tamaso ma jyotirgamaya, mrityor ma amritam gamaya',
        'Om Namah Shivaya',
        'Gayatri Mantra',
        'Maha Mrityunjaya Mantra',
      ],
      correctIndex: 0,
      explanation:
        'Brihadaranyaka Upanishad 1.3.28 contains the Pavamana Mantra: "Lead me from untruth to truth, from darkness to light, from death to immortality."',
      sourceRef: 'Brihadaranyaka Upanishad 1.3.28',
    },
    {
      questionText: 'Which Upanishad contains the national motto of India, "Satyameva Jayate" (Truth alone triumphs)?',
      options: ['Mundaka Upanishad', 'Mandukya Upanishad', 'Kena Upanishad', 'Shvetashvatara Upanishad'],
      correctIndex: 0,
      explanation:
        'Mundaka Upanishad 3.1.6 proclaims: "Satyameva jayate nānṛtam" — Truth alone triumphs, not falsehood.',
      sourceRef: 'Mundaka Upanishad 3.1.6',
    },
    {
      questionText: 'In Mandukya Upanishad, what are the four states of consciousness corresponding to the sacred syllable AUM?',
      options: [
        'Waking (Jagrat), Dreaming (Svapna), Deep Sleep (Sushupti), and the Transcendent Witness (Turiya)',
        'Childhood, Youth, Adulthood, and Old Age',
        'Sattva, Rajas, Tamas, and Prakriti',
        'Earth, Atmosphere, Heaven, and Underworld',
      ],
      correctIndex: 0,
      explanation:
        'Mandukya Upanishad analyzes the three phenomenal states of consciousness culminating in Turiya, the non-dual baseline awareness.',
      sourceRef: 'Mandukya Upanishad 1-12',
    },
    {
      questionText: 'In Kena Upanishad 1.1, what fundamental philosophical inquiry initiates the seeker\'s dialogue?',
      options: [
        '"By whom willed and directed does the mind soar to its object? By whose command does vital breath move?"',
        'How can one amass gold in mercantile trade?',
        'Which planet orbits fastest in the night sky?',
        'Why do kingdoms fall to invading armies?',
      ],
      correctIndex: 0,
      explanation:
        'Kena Upanishad opens by investigating the primary conscious power behind cognitive perception and life itself.',
      sourceRef: 'Kena Upanishad 1.1',
    },
    {
      questionText: 'In Taittiriya Upanishad, what are the five sheaths (Pancha Koshas) that veil the innermost Self?',
      options: [
        'Annamaya (food/body), Pranamaya (vital breath), Manomaya (mind), Vijnanamaya (intellect), and Anandamaya (bliss)',
        'Vata, Pitta, Kapha, Agni, and Ojas',
        'Gold, Silver, Bronze, Iron, and Clay',
        'Sight, Hearing, Taste, Smell, and Touch',
      ],
      correctIndex: 0,
      explanation:
        'Taittiriya Upanishad 2.1-5 systematically outlines the 5 concentric sheaths of human personality covering the Atman.',
      sourceRef: 'Taittiriya Upanishad 2.1-5',
    },
    {
      questionText: 'What is the Mahavakya of the Aitareya Upanishad from the Rigveda?',
      options: [
        'Prajnanam Brahma (Consciousness is Brahman)',
        'Aham Brahmasmi (I am Brahman)',
        'Tat Tvam Asi (That Thou Art)',
        'Ayam Atma Brahma (This Self is Brahman)',
      ],
      correctIndex: 0,
      explanation:
        'Aitareya Upanishad 3.1.3 defines ultimate reality as pure consciousness: Prajnanam Brahma.',
      sourceRef: 'Aitareya Upanishad 3.1.3',
    },
    {
      questionText: 'In Katha Upanishad 1.2, what vital choice did Yama offer to young Nachiketa regarding human destiny?',
      options: [
        'The choice between Shreyas (the spiritually good and enduring) and Preyas (the immediately pleasant and fleeting)',
        'The choice between an army of elephants or a kingdom of gold',
        'The choice between living underwater or in the sky',
        'The choice between learning grammar or poetry',
      ],
      correctIndex: 0,
      explanation:
        'Yama explains that every human confronts Shreyas (beneficial truth) vs Preyas (sensual pleasantness); the wise choose Shreyas.',
      sourceRef: 'Katha Upanishad 1.2.1-2',
    },
  ],
  ayurveda: [
    {
      questionText: 'What are the three biological humors (Tridoshas) in classical Ayurveda?',
      options: [
        'Sattva, Rajas, Tamas',
        'Vata, Pitta, Kapha',
        'Prana, Tejas, Ojas',
        'Rasa, Rakta, Mamsa',
      ],
      correctIndex: 1,
      explanation:
        'The Tridoshas are Vata (kinetic/air-ether), Pitta (metabolic/fire-water), and Kapha (structural/water-earth).',
      sourceRef: 'Charaka Samhita Sutrasthana 1.57',
    },
    {
      questionText: 'Which taste (Rasa) is primarily pacifying to Pitta and aggravating to Vata?',
      options: [
        'Pungent (Katu)',
        'Astringent (Kashaya) and Bitter (Tikta)',
        'Salty (Lavana)',
        'Sour (Amla)',
      ],
      correctIndex: 1,
      explanation:
        'Bitter (Tikta) and Astringent (Kashaya) tastes are cooling and detoxifying, pacifying Pitta while potentially increasing Vata if overused.',
      sourceRef: 'Charaka Samhita Sutrasthana 26.42',
    },
    {
      questionText: 'What is the role of "Ojas" in Ayurvedic physiology?',
      options: [
        'The vital essence of all seven tissues (Dhatus) responsible for immunity and vitality',
        'A toxic metabolic waste material',
        'An abdominal muscle layer',
        'A seasonal headache',
      ],
      correctIndex: 0,
      explanation:
        'Ojas is the refined essence of Dhatus that bestows immune strength, physical resilience, and luminous vitality (Bala).',
      sourceRef: 'Charaka Samhita Sutrasthana 17.74',
    },
    {
      questionText: 'According to Charaka Samhita Sutrasthana 1.41, what is the foundational definition and scope of Ayurveda?',
      options: [
        'A collection of surgical procedures for battlefield trauma exclusively',
        'The sacred science that articulates wholesome and unwholesome, joyful and sorrowful lifespans, along with measures for longevity',
        'The study of mystical incantations without physical dietetics',
        'A medicinal system concerned only with elderly patients',
      ],
      correctIndex: 1,
      explanation:
        'Charaka Samhita 1.41 defines Ayurveda as knowledge of what is wholesome (Hita) and unwholesome (Ahita) for human lifespan (Ayu).',
      sourceRef: 'Charaka Samhita Sutra 1.41',
    },
    {
      questionText: 'According to Charaka Samhita Sutrasthana 5.3, what primary physiological factor determines the appropriate quantity of food (Ahara-matra)?',
      options: [
        'Social customs and caloric charts',
        'The individual strength of one’s digestive fire (Agni-bala)',
        'Consuming food until fullness is reached regardless of digestion',
        'The visual appeal of the meal',
      ],
      correctIndex: 1,
      explanation:
        'Charaka teaches: "Mātrāśī syāt; āhāra-mātrā punar agni-balāpekṣiṇī" — food must be eaten in measure determined by digestive fire.',
      sourceRef: 'Charaka Samhita Sutra 5.3',
    },
    {
      questionText: 'What fundamental distinction does Charaka Samhita Sutrasthana 7.3-6 draw regarding natural urges (Vegas)?',
      options: [
        'Never suppress physical urges (like bowel or bladder), but consciously restrain destructive mental surges of greed, anger, fear, and pride',
        'Suppress all natural bodily reflexes while giving full vent to emotional fury',
        'Physical and mental urges should both be freely indulged at all times',
        'Mental impulses should be completely ignored',
      ],
      correctIndex: 0,
      explanation:
        'Charaka specifies that physiological eliminations must never be forcefully retained, whereas ethical urges of passion and greed must be restrained.',
      sourceRef: 'Charaka Samhita Sutra 7.3-6',
    },
    {
      questionText: 'What are the Saptadhatus (seven fundamental bodily tissues) recognized in Ayurveda in sequential maturation?',
      options: [
        'Rasa (plasma), Rakta (blood), Mamsa (muscle), Meda (fat), Asthi (bone), Majja (marrow/nerve), and Shukra (reproductive essence)',
        'Vata, Pitta, Kapha, Prana, Tejas, Ojas, and Agni',
        'Skin, Hair, Nails, Teeth, Eyes, Tongue, and Ears',
        'Arteries, Veins, Capillaries, Lymph, Nerves, Tendons, and Ligaments',
      ],
      correctIndex: 0,
      explanation:
        'Ayurveda teaches that digested nutrient fluid (Ahara-rasa) progressively nourishes each of the seven Dhatus in turn.',
      sourceRef: 'Charaka Samhita Chikitsasthana 15.16',
    },
    {
      questionText: 'In classical Ayurveda, how is acute fever (Jvara) understood from an etiologic standpoint?',
      options: [
        'Internal digestive fire (Agni) is displaced into the peripheral circulation by toxic metabolic residue (Ama)',
        'An imbalance caused exclusively by sleeping on the floor',
        'A condition arising solely from drinking too much cold water',
        'A failure of the nervous system to generate electrical impulses',
      ],
      correctIndex: 0,
      explanation:
        'Charaka Chikitsa 3 teaches that in Jvara, impaired Agni mixes with Ama and is forced out of the gastrointestinal tract into Rasa Dhatu.',
      sourceRef: 'Charaka Samhita Chikitsa 3.15',
    },
    {
      questionText: 'What is the role of Ritucharya (seasonal regimen) in maintaining Ayurvedic equilibrium?',
      options: [
        'Adapting diet and daily routines across the six seasons (Ritus) to prevent seasonal dosha accumulation and aggravation',
        'Fasting continuously during all changes of the lunar calendar',
        'Changing one\'s profession with every change of weather',
        'Eating identical meals year-round regardless of climate',
      ],
      correctIndex: 0,
      explanation:
        'Ritucharya teaches proactive lifestyle and dietary adjustments to counterbalance natural environmental shifts in heat, cold, and humidity.',
      sourceRef: 'Charaka Samhita Sutrasthana 6.1-4',
    },
    {
      questionText: 'What is Prajnaparadha, identified in Charaka Samhita as a primary root cause of psychological and bodily illness?',
      options: [
        '"Crimes against wisdom" — willfully acting against one’s own better judgment and natural ethical intuition through sensory overindulgence',
        'Genetic defects inherited from distant ancestors',
        'Accidental physical trauma from falling',
        'Failure to memorize Sanskrit medical vocabulary',
      ],
      correctIndex: 0,
      explanation:
        'Charaka Sharirasthana 1.102 defines Prajnaparadha as intellectual error where passion or delusion overrules discrimination, causing harmful conduct.',
      sourceRef: 'Charaka Samhita Sharirasthana 1.102',
    },
  ],
  mahabharata: [
    {
      questionText: 'Who was granted divine vision (Divya Drishti) by Sage Vyasa to narrate the battlefield events to Dhritarashtra?',
      options: ['Vidura', 'Sanjaya', 'Kripacharya', 'Dronacharya'],
      correctIndex: 1,
      explanation:
        'Sanjaya was blessed with Divya Drishti by Vyasa to witness and report everything transpiring at Kurukshetra.',
      sourceRef: 'Mahabharata Bhishma Parva',
    },
    {
      questionText: 'What was the central ethical dilemma confronted by Yudhishthira at the Yaksha Prashna?',
      options: [
        'How to forge golden weaponry',
        'Answering questions on Dharma, truth, and human nature to revive his fallen brothers',
        'Deciding whether to build a palace',
        'Navigating the dense forest alone',
      ],
      correctIndex: 1,
      explanation:
        "Yudhishthira answered the Yaksha's profound questions regarding wisdom, patience, and righteousness with immaculate clarity.",
      sourceRef: 'Mahabharata Vana Parva 313',
    },
    {
      questionText: 'In Mahabharata Shanti Parva 109.11, what is the etymological root and essential function of Dharma?',
      options: [
        'It is derived from "dharana" (to uphold and sustain), because it preserves and nurtures all living beings and human society',
        'It represents arbitrary commands issued by victorious monarchs',
        'It denotes withdrawal from all social engagement into seclusion',
        'It refers exclusively to temple ceremonies',
      ],
      correctIndex: 0,
      explanation:
        'Vyasa explains: "Dhāraṇād dharmam ity āhur dharmo dhārayate prajāḥ" — Dharma is that which upholds, preserves, and integrates creation.',
      sourceRef: 'Mahabharata Shanti Parva 109.11',
    },
    {
      questionText: 'According to Vidura Niti (Mahabharata 33.16), how do wise individuals (pandita-buddhaya) respond when acute adversity strikes?',
      options: [
        'They panic and blame others for their plight',
        'They do not become bewildered or paralyzed; they remain actively diligent, steadfast in duty, and anchored in truth',
        'They immediately abandon their moral vows to secure temporary relief',
        'They surrender to fatalism and cease all constructive effort',
      ],
      correctIndex: 1,
      explanation:
        'Vidura teaches that true wisdom is tested in adversity: wise leaders do not succumb to confusion; they remain persevering and truthful.',
      sourceRef: 'Mahabharata Vidura Niti 33.16',
    },
    {
      questionText: 'In the Yaksha Prashna (Mahabharata Vana Parva 313), what did Yudhishthira declare to be the greatest wonder of the world?',
      options: [
        'Witnessing countless living beings pass away every single day, yet those remaining act as if they will live forever',
        'The depth and treasures of the subterranean worlds',
        'The immense speed of solar chariots traversing the sky',
        'The creation of golden cities by ancient architects',
      ],
      correctIndex: 0,
      explanation:
        'Yudhishthira stated: "Day after day mortals enter the house of death, yet the living think themselves permanent. What could be more astonishing?"',
      sourceRef: 'Mahabharata Vana Parva 313.116',
    },
    {
      questionText: 'Which Parva of the Mahabharata contains the celebrated discourse on statecraft, ethics, and liberation given by Bhishma on his bed of arrows?',
      options: ['Shanti Parva', 'Adi Parva', 'Virata Parva', 'Mausala Parva'],
      correctIndex: 0,
      explanation:
        'Shanti Parva is the massive philosophical treasure of the epic where Bhishma instructs Yudhishthira on governance, crisis duty, and Moksha.',
      sourceRef: 'Mahabharata Shanti Parva',
    },
    {
      questionText: 'What fundamental moral counsel did Prime Minister Vidura impart to King Dhritarashtra regarding unbridled ambition?',
      options: [
        'Coveting the rightful share of others without justice will consume one\'s own dynasty like a fire consuming dry grass',
        'Wealth justifies all means regardless of deceit',
        'War should be initiated without negotiations',
        'Ministers should never challenge royal whims',
      ],
      correctIndex: 0,
      explanation:
        'Vidura repeatedly cautioned Dhritarashtra that favoring Duryodhana\'s greed over Dharma would inevitably destroy the Kuru dynasty.',
      sourceRef: 'Mahabharata Udyoga Parva 33.40',
    },
    {
      questionText: 'In the Mahabharata, why is the concept of "Apad-dharma" articulated during extreme societal breakdowns?',
      options: [
        'To guide conduct during catastrophic crises when normal rules of duty cannot be preserved without sacrificing life itself',
        'To abolish all ethical boundaries permanently',
        'To allow rulers to confiscate public property at will',
        'To encourage citizens to renounce all societal laws',
      ],
      correctIndex: 0,
      explanation:
        'Apad-dharma (Dharma in calamity) provides ethical discernment for survival and righteousness during acute emergencies.',
      sourceRef: 'Mahabharata Shanti Parva 130-140',
    },
    {
      questionText: 'Which deity assisted Sage Vyasa in writing down the verse composition of the Mahabharata as Vyasa recited it?',
      options: ['Lord Ganesha', 'Lord Kartikeya', 'Lord Indra', 'Lord Agni'],
      correctIndex: 0,
      explanation:
        'Tradition recounts that Lord Ganesha served as scribe on condition that Vyasa recited without pausing, while Ganesha wrote only after comprehending each verse.',
      sourceRef: 'Mahabharata Adi Parva 1',
    },
    {
      questionText: 'What is the concluding affirmation of the Mahabharata in the Bharata Savitri (Svargarohanika Parva)?',
      options: [
        '"From Dharma arise both prosperity and joy; why then is Dharma not practiced by all with pure dedication?"',
        'Power alone dictates truth in human history',
        'The earth will permanently dissolve into darkness',
        'Victory in war brings lasting worldly satisfaction',
      ],
      correctIndex: 0,
      explanation:
        'Vyasa raises his arms in the final chapter proclaiming that righteousness alone generates enduring peace, prosperity, and truth.',
      sourceRef: 'Mahabharata Svargarohana Parva 5.62',
    },
  ],
  ramayana: [
    {
      questionText: 'Why is Sri Rama revered as "Maryada Purushottama" in the Ramayana?',
      options: [
        'He accumulated supreme worldly wealth',
        'He is the embodiment of righteousness who strictly adhered to moral boundaries and Dharma across all trials',
        'He never left Ayodhya',
        'He wrote the Vedas',
      ],
      correctIndex: 1,
      explanation:
        'Maryada Purushottama means the supreme human being who exemplifies the highest ideals of moral conduct and ethical boundaries.',
      sourceRef: 'Valmiki Ramayana Ayodhya Kanda',
    },
    {
      questionText: "In Valmiki Ramayana, which sage narrates the original epic story to Rama's twin sons Lava and Kusha?",
      options: ['Sage Valmiki', 'Sage Vishvamitra', 'Sage Vasishtha', 'Sage Agastya'],
      correctIndex: 0,
      explanation:
        'Sage Valmiki, the Adi Kavi (first poet), authored the Ramayana and taught it to Lava and Kusha in his hermitage.',
      sourceRef: 'Valmiki Ramayana Bala Kanda',
    },
    {
      questionText: 'In Valmiki Ramayana Kishkindha Kanda, what was the moral foundation of the alliance between Rama and Sugriva?',
      options: [
        'A solemn covenant of mutual assistance in upholding Dharma and rescuing those wronged by injustice',
        'A commercial trade agreement exchanging gems for military forces',
        'A treaty mediated by royal ambassadors without personal meeting',
        'A temporary truce to divide northern territories',
      ],
      correctIndex: 0,
      explanation:
        'Rama and Sugriva forged their pact before the sacred fire, uniting in mutual respect and commitment to justice.',
      sourceRef: 'Valmiki Ramayana Kishkindha Kanda 5',
    },
    {
      questionText: 'What exemplary qualities of service and self-mastery are personified by Sri Hanuman in Sundara Kanda?',
      options: [
        'Unflinching devotion, discriminative intelligence, boundless courage, and ego-free dedication to truth',
        'Sensual desire and pursuit of worldly fame',
        'Pride in physical prowess without moral discipline',
        'Seeking sovereignty over Kishkindha',
      ],
      correctIndex: 0,
      explanation:
        'Sundara Kanda showcases Hanuman\'s perfection of intellect (Buddhi), strength (Bala), and selfless devotion.',
      sourceRef: 'Valmiki Ramayana Sundara Kanda',
    },
    {
      questionText: 'Why did Vibhishana leave Lanka to seek refuge (Sharanagati) with Sri Rama in Yuddha Kanda?',
      options: [
        'Because Ravana rejected his righteous counsel to return Sita and choose peace, making alignment with Dharma paramount',
        'Because he coveted the throne of Lanka before the battle began',
        'Because Lanka suffered from famine',
        'Because he was expelled by court astrologers',
      ],
      correctIndex: 0,
      explanation:
        'Vibhishana placed allegiance to universal Dharma above blind loyalty to a tyrannical king who refused righteous counsel.',
      sourceRef: 'Valmiki Ramayana Yuddha Kanda 17-19',
    },
    {
      questionText: 'What sacred hymn did Sage Agastya impart to Sri Rama on the battlefield to renew his physical and mental fortitude?',
      options: ['Aditya Hridaya Stotram', 'Vishnu Sahasranama', 'Shiva Tandava Stotram', 'Hanuman Chalisa'],
      correctIndex: 0,
      explanation:
        'In Yuddha Kanda 105, Sage Agastya imparted the solar hymn Aditya Hridaya, invoking divine endurance, focus, and victory.',
      sourceRef: 'Valmiki Ramayana Yuddha Kanda 105',
    },
    {
      questionText: 'Why did Lakshmana insist on accompanying Sri Rama into fourteen years of forest exile?',
      options: [
        'Out of deep, unshakeable brotherly love and dedicated vow to protect Rama and Sita through all adversities',
        'Because he had no position in Ayodhya',
        'Because he was commanded by Queen Kaikeyi to leave',
        'Because he preferred forest life to royal responsibilities',
      ],
      correctIndex: 0,
      explanation:
        'Lakshmana demonstrated peerless fraternal devotion, declaring that Ayodhya without Rama was a wilderness, and the forest with Rama was paradise.',
      sourceRef: 'Valmiki Ramayana Ayodhya Kanda 31',
    },
    {
      questionText: 'How did King Dasharatha\'s son Bharata demonstrate supreme detachment and integrity upon Rama\'s exile?',
      options: [
        'He refused the crown, placed Rama\'s wooden sandals (Padukas) on the throne, and governed selflessly as a regent from Nandigrama',
        'He crowned himself king and banished Lakshmana',
        'He abandoned the kingdom and traveled to foreign continents',
        'He waged war against his own mother Kaikeyi',
      ],
      correctIndex: 0,
      explanation:
        'Bharata\'s governance under Rama\'s sandals is revered as the epitome of selfless leadership and moral renunciation.',
      sourceRef: 'Valmiki Ramayana Ayodhya Kanda 115',
    },
    {
      questionText: 'What heroic sacrifice did the elderly vulture king Jatayu make in Aranya Kanda?',
      options: [
        'He fearlessly fought Ravana in mid-air to protect Mother Sita from abduction, sacrificing his life in the cause of righteousness',
        'He flew across the solar orb to bring celestial water',
        'He guarded the entrance to the Dandaka forest',
        'He built a nest in the royal court of Ayodhya',
      ],
      correctIndex: 0,
      explanation:
        'Jatayu gave his life defending Sita against Ravana, receiving liberation and the highest funeral honors directly from Sri Rama.',
      sourceRef: 'Valmiki Ramayana Aranya Kanda 50-52',
    },
    {
      questionText: 'What metrical verse format (Chhandas) was spontaneously created by Sage Valmiki upon witnessing the hunter\'s cruelty?',
      options: ['Anushtubh Shloka', 'Gayatri Chhandas', 'Trishtubh', 'Jagati'],
      correctIndex: 0,
      explanation:
        'Out of deep grief (Shoka) at the separation of the Krauncha birds, Valmiki uttered the first rhythmic verse (Shloka) in classical Anushtubh meter.',
      sourceRef: 'Valmiki Ramayana Bala Kanda 2.15',
    },
  ],
  panchatantra: [
    {
      questionText: 'Who is the traditional scholar credited with authoring the Panchatantra fables to educate princes in statecraft (Niti)?',
      options: ['Pandit Vishnu Sharma', 'Kalidasa', 'Bhavabhuti', 'Banabhatta'],
      correctIndex: 0,
      explanation:
        'Pandit Vishnu Sharma created the animal fables in five tantras (books) to impart wisdom and practical life discernment to three young princes.',
      sourceRef: 'Panchatantra Kathamukha',
    },
    {
      questionText: 'What is the overarching moral taught in the story of the talkative turtle and the two geese?',
      options: [
        'Always swim in cold water',
        'Untimely speech and inability to restrain one’s tongue in crisis leads to ruin',
        'Birds cannot be trusted by reptiles',
        'Traveling alone is superior',
      ],
      correctIndex: 1,
      explanation:
        'The fable highlights that keeping quiet when instructed by wise friends is vital for safety, whereas uncontrolled speech invites calamity.',
      sourceRef: 'Panchatantra Book 1',
    },
    {
      questionText: 'What are the five Tantras (books) that constitute the structure of the Panchatantra?',
      options: [
        'Mitra-bheda (Loss of Friends), Mitra-labha (Gaining Friends), Kakolukiyam (War and Peace of Crows/Owls), Labdhapranasham (Loss of Gains), and Aparikshitakarakam (Ill-considered Action)',
        'Dharma, Artha, Kama, Moksha, and Yoga',
        'Veda, Vedanga, Upanishad, Purana, and Itihasa',
        'Rig, Sama, Yajur, Atharva, and Ayurveda',
      ],
      correctIndex: 0,
      explanation:
        'The five books systematically cover the five strategic dimensions of human alliances, conflict, preservation, and discernment.',
      sourceRef: 'Panchatantra Kathamukha',
    },
    {
      questionText: 'In the Panchatantra tale of the Brahmin and the Mongoose, what acute life lesson is imparted?',
      options: [
        'Never act hastily in anger or panic without investigating facts, lest irreversible regret follow',
        'Animals can never be kept as domestic pets',
        'Mongoose and snakes are natural allies',
        'Brahmins should never travel away from their homes',
      ],
      correctIndex: 0,
      explanation:
        'The mother killed the faithful mongoose thinking it had harmed her infant, only to discover it had saved the child by killing a cobra. Rash action breeds remorse.',
      sourceRef: 'Panchatantra Book 5',
    },
    {
      questionText: 'What political strategy is demonstrated in the fable of the crows and owls (Kakolukiyam)?',
      options: [
        'Infiltrating an adversary\'s camp through feigned vulnerability and studying their inner weaknesses before launching a decisive strike',
        'Surrendering all territory unconditionally',
        'Fighting open daylight battles with numerical disadvantage',
        'Relying solely on magical enchantments',
      ],
      correctIndex: 0,
      explanation:
        'The crow minister feigned mistreatment, gained the owls\' trust inside their cave fortress, and destroyed the threat by understanding their routine.',
      sourceRef: 'Panchatantra Book 3',
    },
    {
      questionText: 'In the tale of the monkey and the crocodile (Labdhapranasham), how does the monkey save his life when taken into deep water?',
      options: [
        'Through rapid wit and presence of mind, convincing the crocodile that his heart was left behind in the jambu tree',
        'By overpowering the crocodile through sheer physical strength',
        'By swimming faster than the crocodile',
        'By calling upon sea monsters for assistance',
      ],
      correctIndex: 0,
      explanation:
        'The fable demonstrates that presence of mind (Pratyutpannamatitva) rescues a person from grave danger where strength alone fails.',
      sourceRef: 'Panchatantra Book 4',
    },
    {
      questionText: 'What moral is taught by the fable of the Blue Jackal who fell into the dyer\'s vat?',
      options: [
        'Artificial pretension and false authority collapse the moment natural instincts and speech are inadvertently revealed',
        'Blue dyes possess royal qualities',
        'Jackals make righteous monarchs in forests',
        'One should dye clothes during rainy seasons',
      ],
      correctIndex: 0,
      explanation:
        'The blue jackal claimed to be sent by Brahma, but howled when other jackals howled at dusk; his true nature was exposed and he was expelled.',
      sourceRef: 'Panchatantra Book 1',
    },
    {
      questionText: 'In the story of the mouse, crow, deer, and turtle (Mitra-labha), what essential truth of alliance is proved?',
      options: [
        'Even physically small and humble beings, when united in genuine loyalty and coordinated action, overcome powerful predators',
        'Only large and wealthy individuals can form effective partnerships',
        'Turtles should never venture on dry land',
        'Hunters cannot be outwitted by forest animals',
      ],
      correctIndex: 0,
      explanation:
        'The four diverse creatures combined their unique strengths (flying, cutting ropes, swimming, creating diversions) to repeatedly save one another from the hunter.',
      sourceRef: 'Panchatantra Book 2',
    },
    {
      questionText: 'What strategic counsel does the fable of the Lion and the Bull (Mitra-bheda) illustrate regarding court intrigue?',
      options: [
        'Cunning and malicious instigators can sever the deepest friendship between honorable leaders if they allow unverified whispers to seed mistrust',
        'Lions and bulls should never enter commercial trade',
        'Herbivores always defeat carnivores in diplomacy',
        'Forest kings should never consult counselors',
      ],
      correctIndex: 0,
      explanation:
        'The jackal Damanaka sowed false suspicion between King Pingalaka and the noble bull Sanjivaka, teaching rulers never to believe slander without direct investigation.',
      sourceRef: 'Panchatantra Book 1',
    },
    {
      questionText: 'In the story of the old swan who advised destroying the tiny creeper around the banyan tree, what principle of foresight is taught?',
      options: [
        'Nip emerging vulnerabilities and dangers in the bud while they are small, before they grow into lethal threats that enable an enemy\'s ascent',
        'All creepers on trees produce delicious fruit',
        'Swans should avoid living near banyan trees',
        'Hunters never use trees to climb',
      ],
      correctIndex: 0,
      explanation:
        'The birds ignored the small vine until it grew into a thick ladder that allowed a hunter to climb up and spread his net; foresight prevents calamity.',
      sourceRef: 'Panchatantra Book 1',
    },
  ],
  yoga: [
    {
      questionText: 'In Yoga Sutras 1.2, how does Maharishi Patanjali define the fundamental essence of Yoga?',
      options: [
        'Physical gymnastics and difficult bodily postures alone',
        'The intentional stilling of the fluctuations of the mind-field (Chitta Vritti Nirodha)',
        'Sensual indulgence without moral boundaries',
        'Mechanical recitation without inner inquiry',
      ],
      correctIndex: 1,
      explanation:
        'Patanjali Yoga Sutras 1.2 teaches: "Yogaś citta-vṛtti-nirodhaḥ" — Yoga is the intentional mastery and stilling of the fluctuations of consciousness.',
      sourceRef: 'Yoga Sutras 1.2',
    },
    {
      questionText: 'According to Yoga Sutras 1.12, through what twin disciplines are mental fluctuations stilled?',
      options: [
        'Persistent practice (Abhyasa) and conscious dispassion (Vairagya)',
        'Sleep and material accumulation',
        'Fasting alone without philosophical reflection',
        'External combat and argument',
      ],
      correctIndex: 0,
      explanation:
        'Yoga Sutras 1.12 establishes Abhyasa (consistent dedicated effort) and Vairagya (non-clinging to passing phenomena) as the foundational twin pillars.',
      sourceRef: 'Yoga Sutras 1.12-14',
    },
    {
      questionText: 'What fourfold attitude does Patanjali prescribe in Yoga Sutras 1.33 for cultivating serene clarity of mind?',
      options: [
        'Friendship to the joyful, compassion to the sorrowful, gladness for the virtuous, and equanimity toward the difficult',
        'Complete isolation and indifference toward all beings',
        'Constant suspicion and competition with colleagues',
        'Public criticism of others\' errors',
      ],
      correctIndex: 0,
      explanation:
        'Yoga Sutras 1.33 teaches Chitta Prasadana through Maitri (friendship), Karuna (compassion), Mudita (joy), and Upeksha (equanimity).',
      sourceRef: 'Yoga Sutras 1.33',
    },
    {
      questionText: 'What cognitive practice does Patanjali prescribe in Yoga Sutras 2.33 when disturbed by destructive or harmful thoughts?',
      options: [
        'Suppression of memory through sleep',
        'Pratipaksha Bhavana: intentionally cultivating and contemplating the opposite uplifting, constructive perspective',
        'Blaming external adversaries for inner agitation',
        'Vigorous physical retaliation',
      ],
      correctIndex: 1,
      explanation:
        'Yoga Sutras 2.33 states: "Vitarka-bādhane pratipakṣa-bhāvanam" — when troubled by destructive thoughts, cultivate the opposite elevating counter-thought.',
      sourceRef: 'Yoga Sutras 2.33',
    },
    {
      questionText: 'What are the five Yamas (universal ethical restraints) in Ashtanga Yoga (YS 2.30)?',
      options: [
        'Ahimsa (non-harming), Satya (truthfulness), Asteya (non-stealing), Brahmacharya (moderation), and Aparigraha (non-grasping)',
        'Saucha, Santosha, Tapas, Svadhyaya, and Ishvara Pranidhana',
        'Asana, Pranayama, Pratyahara, Dharana, and Dhyana',
        'Vata, Pitta, Kapha, Agni, and Ojas',
      ],
      correctIndex: 0,
      explanation:
        'Yoga Sutras 2.30 details the foundational ethical bedrock (Mahavrata) applicable across all cultures and times.',
      sourceRef: 'Yoga Sutras 2.30',
    },
    {
      questionText: 'What are the five Niyamas (personal spiritual observances) codified in Yoga Sutras 2.32?',
      options: [
        'Saucha (purity), Santosha (contentment), Tapas (disciplined effort), Svadhyaya (self-study), and Ishvara Pranidhana (surrender to truth)',
        'Ahimsa, Satya, Asteya, Brahmacharya, and Aparigraha',
        'Pratyahara, Dharana, Dhyana, Samadhi, and Moksha',
        'Jnanendriya, Karmendriya, Tanmatra, Mahabhuta, and Antahkarana',
      ],
      correctIndex: 0,
      explanation:
        'Yoga Sutras 2.32 establishes the internal disciplines that purify individual psychology and prepare the mind for meditation.',
      sourceRef: 'Yoga Sutras 2.32',
    },
    {
      questionText: 'How does Maharishi Patanjali define the quality of physical posture (Asana) in Yoga Sutras 2.46?',
      options: [
        '"Sthira-sukham asanam" — steady, firm, and comfortable/joyful',
        'Painful contortion endured through sheer willpower',
        'Rapid athletic movement without stillness',
        'Remaining completely stationary for 48 hours without blinking',
      ],
      correctIndex: 0,
      explanation:
        'YS 2.46 teaches that an authentic asana must combine stability (Sthira) with ease and comfort (Sukha), releasing effort into infinity.',
      sourceRef: 'Yoga Sutras 2.46',
    },
    {
      questionText: 'What are the five Kleshas (fundamental afflictions of consciousness) identified in Yoga Sutras 2.3?',
      options: [
        'Avidya (spiritual ignorance), Asmita (egoic identification), Raga (clinging attachment), Dvesha (aversion), and Abhinivesha (fear of death)',
        'Hunger, Thirst, Fatigue, Cold, and Heat',
        'Grief, Guilt, Shame, Regret, and Envy',
        'Doubt, Carelessness, Sloth, Delusion, and Instability',
      ],
      correctIndex: 0,
      explanation:
        'YS 2.3 explains that Avidya is the breeding ground for the other four afflictions that agitate consciousness.',
      sourceRef: 'Yoga Sutras 2.3',
    },
    {
      questionText: 'In Ashtanga Yoga, what is the practice of "Pratyahara" (the fifth limb)?',
      options: [
        'The inward withdrawal and decoupling of sensory organs from external objects, turning awareness inward',
        'Consuming only herbal roots and fruit juices',
        'Breathing through one nostril exclusively',
        'Chanting mantras in a forest hermitage',
      ],
      correctIndex: 0,
      explanation:
        'YS 2.54 describes Pratyahara as senses mimicking the nature of the mind by detaching from external sensory stimuli.',
      sourceRef: 'Yoga Sutras 2.54',
    },
    {
      questionText: 'What triad of inner meditative limbs constitutes "Samyama" in the third chapter of the Yoga Sutras?',
      options: [
        'Dharana (concentration), Dhyana (unbroken meditation), and Samadhi (complete meditative absorption)',
        'Yama, Niyama, and Asana',
        'Pranayama, Pratyahara, and Dharana',
        'Shravana, Manana, and Nididhyasana',
      ],
      correctIndex: 0,
      explanation:
        'Yoga Sutras 3.4 defines Samyama as the seamless practice of concentration, meditation, and absorption focused upon a single truth.',
      sourceRef: 'Yoga Sutras 3.4',
    },
  ],
  general: [
    {
      questionText: 'What are the four Purusharthas (legitimate goals of human life) recognized in classical Indian philosophy?',
      options: [
        'Vata, Pitta, Kapha, Agni',
        'Dharma (righteousness), Artha (wealth), Kama (desire), and Moksha (spiritual liberation)',
        'Sattva, Rajas, Tamas, Prakriti',
        'Brahma, Vishnu, Shiva, Indra',
      ],
      correctIndex: 1,
      explanation:
        'The four Purusharthas constitute the holistic blueprint for human pursuit: Dharma (ethics), Artha (security/resources), Kama (joy/fulfillment), and Moksha (transcendence).',
      sourceRef: 'Dharmashastra',
    },
    {
      questionText: 'What is the literal translation and philosophical meaning of "Sat-Chit-Ananda"?',
      options: [
        'Truth, Consciousness, and Absolute Bliss',
        'Past, Present, and Future',
        'Mind, Body, and Breath',
        'Creation, Sustenance, and Dissolution',
      ],
      correctIndex: 0,
      explanation:
        'Sat (Existence/Truth), Chit (Awareness/Consciousness), and Ananda (Bliss) describe the non-dual nature of Brahman.',
      sourceRef: 'Taittiriya Upanishad',
    },
    {
      questionText: 'What are the four Vedas that form the primary canonical foundation of Vedic literature?',
      options: [
        'Rigveda, Samaveda, Yajurveda, and Atharvaveda',
        'Ramayana, Mahabharata, Bhagavata, and Harivamsa',
        'Charaka, Sushruta, Vagbhata, and Sharangadhara',
        'Sankhya, Yoga, Nyaya, and Vaisheshika',
      ],
      correctIndex: 0,
      explanation:
        'The four canonical Vedas contain the mantras, liturgical melodies, sacrificial formulas, and philosophical hymns of ancient seers.',
      sourceRef: 'Vedic Samhitas',
    },
    {
      questionText: 'In Indian ethics and cosmology, what is the meaning and scope of "Rta"?',
      options: [
        'The universal cosmic moral order and dynamic harmony that governs the unfolding of nature and truth',
        'A formal monetary debt owed to an employer',
        'A military strategy of encircling fortified cities',
        'A winter meteorological wind',
      ],
      correctIndex: 0,
      explanation:
        'In the Rigveda, Rta represents the underlying cosmic order, truth, and moral principle sustaining the universe.',
      sourceRef: 'Rigveda 4.23',
    },
    {
      questionText: 'What are the three fundamental qualities of material nature (Trigunas) in Sankhya and Vedanta philosophy?',
      options: [
        'Sattva (clarity/harmony), Rajas (activity/passion), and Tamas (inertia/darkness)',
        'Vata, Pitta, and Kapha',
        'Prana, Apana, and Vyana',
        'Brahma, Vishnu, and Rudra',
      ],
      correctIndex: 0,
      explanation:
        'Prakriti consists of the three Gunas whose dynamic interaction creates all physical and psychological phenomena.',
      sourceRef: 'Sankhya Karika 12-13',
    },
    {
      questionText: 'What are the four traditional Ashramas (stages of human life) in the classical Vedic lifecycle?',
      options: [
        'Brahmacharya (student/learning), Grihastha (householder/duty), Vanaprastha (reflective withdrawal), and Sannyasa (renunciation/transcendence)',
        'Infancy, Youth, Middle Age, and Old Age',
        'Apprentice, Journeyman, Master, and Retired',
        'Priest, Warrior, Merchant, and Artisan',
      ],
      correctIndex: 0,
      explanation:
        'The Ashrama system structures the human lifecycle to balance societal contribution with progressive spiritual liberation.',
      sourceRef: 'Dharmasutras',
    },
    {
      questionText: 'What are the three classifications of Karma recognized in Indian philosophy regarding causal fruition?',
      options: [
        'Sanchita (accumulated past storehouse), Prarabdha (currently fructifying destiny), and Kriyamana (presently generated action)',
        'Good karma, Bad karma, and Neutral karma',
        'Daily karma, Monthly karma, and Annual karma',
        'Verbal karma, Mental karma, and Physical karma only',
      ],
      correctIndex: 0,
      explanation:
        'Classical philosophy distinguishes the total causal store (Sanchita), the allotment shaping this current life (Prarabdha), and fresh free-will deeds (Kriyamana).',
      sourceRef: 'Vedanta Sara',
    },
    {
      questionText: 'What universal declaration of human family is articulated in the Maha Upanishad 6.71?',
      options: [
        '"Vasudhaiva Kutumbakam" — the entire world and all living beings constitute one single family',
        'Every nation must conquer its neighbors',
        'Truth belongs exclusively to one single lineage',
        'Humanity is inherently divided by eternal barriers',
      ],
      correctIndex: 0,
      explanation:
        'Maha Upanishad 6.71 states: "Ayam nijo paro veti gananā laghucetasām, Udāracaritānām tu vasudhaiva kuṭumbakam" — small minds divide; the noble see the world as one family.',
      sourceRef: 'Maha Upanishad 6.71',
    },
    {
      questionText: 'What is the significance of the "Guru-Shishya Parampara" in ancient Indian traditions?',
      options: [
        'An unbroken lineage of direct experiential transmission of wisdom, practice, and ethical values from realized master to qualified seeker',
        'A commercial licensing system for schools',
        'A hereditary monarchy passing judicial authority down to children',
        'A military rank classification',
      ],
      correctIndex: 0,
      explanation:
        'The Guru-Shishya tradition preserves the living spirit, practical nuances, and authentic realization of spiritual sciences through direct relationship.',
      sourceRef: 'Upanishadic Tradition',
    },
    {
      questionText: 'What are the four classical Pramanas (valid means of acquiring true knowledge) recognized in Nyaya and classical philosophy?',
      options: [
        'Pratyaksha (direct perception), Anumana (logical inference), Upamana (analogy/comparison), and Shabda (verified verbal/scriptural testimony)',
        'Guessing, Speculation, Rumor, and Intuition',
        'Reading, Writing, Speaking, and Listening',
        'Seeing, Hearing, Touching, and Tasting',
      ],
      correctIndex: 0,
      explanation:
        'Nyaya epistemology establishes these four rigorous Pramanas to test validity and protect seekers from cognitive delusion.',
      sourceRef: 'Nyaya Sutras 1.1.3',
    },
  ],
  custom: [],
};

export class QuizService {
  private quizRepo: QuizRepository;
  private attemptRepo: QuizAttemptRepository;
  private aiProvider?: AIProvider;
  private ragService?: RAGService;

  constructor(
    quizRepo: QuizRepository,
    attemptRepo: QuizAttemptRepository,
    aiProvider?: AIProvider,
    ragService?: RAGService
  ) {
    this.quizRepo = quizRepo;
    this.attemptRepo = attemptRepo;
    this.aiProvider = aiProvider;
    this.ragService = ragService;
  }

  public async ensureSeeded(): Promise<number> {
    return this.quizRepo.ensureSeeded();
  }

  public async getQuizzes(
    params: QuizFilterParams
  ): Promise<{ quizzes: QuizSummaryDTO[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));

    const { quizzes, total } = await this.quizRepo.findFiltered(params);
    return {
      quizzes: quizzes.map((q) => q.toSummaryDTO()),
      total,
      page,
      limit,
    };
  }

  public async getQuizById(id: string): Promise<QuizClientDTO> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid Quiz ID format');
    }

    const quiz = await this.quizRepo.findById(id);
    if (!quiz || !quiz.isActive) {
      throw new NotFoundError('Quiz not found or currently inactive');
    }

    return quiz.toClientDTO();
  }

  public async getQuizFullById(id: string): Promise<QuizDTO> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid Quiz ID format');
    }

    const quiz = await this.quizRepo.findById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    return quiz.toDTO();
  }

  public async createQuiz(data: CreateQuizDTO): Promise<QuizDTO> {
    const quiz = await this.quizRepo.createQuiz(data);
    return quiz.toDTO();
  }

  public async submitAttempt(
    input: SubmitQuizAttemptInput,
    userId?: string
  ): Promise<QuizAttemptDTO> {
    if (!Types.ObjectId.isValid(input.quizId)) {
      throw new BadRequestError('Invalid Quiz ID format');
    }

    const quiz = await this.quizRepo.findById(input.quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    const answerMap = new Map<number, number>();
    for (const ans of input.answers) {
      answerMap.set(ans.questionIndex, ans.selectedIndex);
    }

    let score = 0;
    const evaluatedAnswers: Array<{
      questionIndex: number;
      questionText: string;
      options: string[];
      selectedIndex: number;
      correctIndex: number;
      isCorrect: boolean;
      explanation: string;
      sourceRef?: string;
    }> = [];

    const weakAreas: string[] = [];

    quiz.questions.forEach((q, idx) => {
      const selectedIndex = answerMap.has(idx) ? answerMap.get(idx)! : -1;
      const isCorrect = selectedIndex === q.correctIndex;

      if (isCorrect) {
        score++;
      } else {
        const areaLabel = q.sourceRef || `${quiz.domain.toUpperCase()} Q${idx + 1}`;
        if (!weakAreas.includes(areaLabel)) {
          weakAreas.push(areaLabel);
        }
      }

      evaluatedAnswers.push({
        questionIndex: idx,
        questionText: q.questionText,
        options: [...q.options],
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        sourceRef: q.sourceRef,
      });
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 60;

    const attemptDoc = await this.attemptRepo.recordAttempt({
      userId: userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
      quizId: new Types.ObjectId(quiz._id.toString()),
      quizTitle: quiz.title,
      domain: quiz.domain,
      difficulty: quiz.difficulty,
      score,
      totalQuestions,
      percentage,
      passed,
      answers: evaluatedAnswers,
      weakAreas,
      timeSpentSeconds: input.timeSpentSeconds || 0,
      completedAt: new Date(),
    });

    return attemptDoc.toDTO();
  }

  public async getUserAttempts(userId: string, limit = 20): Promise<QuizAttemptDTO[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid User ID format');
    }

    const attempts = await this.attemptRepo.findByUser(userId, limit);
    return attempts.map((a) => a.toDTO());
  }

  public async getAttemptById(attemptId: string): Promise<QuizAttemptDTO> {
    if (!Types.ObjectId.isValid(attemptId)) {
      throw new BadRequestError('Invalid Attempt ID format');
    }

    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Quiz attempt not found');
    }

    return attempt.toDTO();
  }

  public async getUserStats(userId: string): Promise<{
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    highestScore: number;
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid User ID format');
    }

    return this.attemptRepo.getUserStats(userId);
  }

  public async generateDynamicQuiz(input: GenerateDynamicQuizInput): Promise<QuizClientDTO> {
    let domain: QuizDomain = input.domain || 'gita';
    if (input.guru) {
      const g = input.guru.toLowerCase();
      if (g.includes('krishna')) domain = 'gita';
      else if (g.includes('chanakya')) domain = 'chanakya';
      else if (g.includes('charak')) domain = 'ayurveda';
      else if (g.includes('vyasa')) domain = 'mahabharata';
      else if (g.includes('patanjali')) domain = 'yoga';
    }

    const difficulty = input.difficulty || 'intermediate';
    const questionCount = Math.min(15, Math.max(1, input.questionCount || 5));
    const topic = input.topic ? input.topic.trim() : `${domain.toUpperCase()} Wisdom`;

    // 1. Retrieve authentic source passages from RAG knowledge base
    interface SourcePassage {
      canonicalReference: string;
      title: string;
      author?: string;
      text: string;
    }

    const sourcePassages: SourcePassage[] = [];
    const seenRefs = new Set<string>();

    if (this.ragService) {
      try {
        const searchQuery = `${topic} ${input.guru || ''} ${domain}`.trim();
        const ragRes = await this.ragService.query({
          query: searchQuery,
          domainFilter: domain === 'yoga' ? 'yoga' : domain,
          topK: Math.max(15, questionCount * 2),
          minScore: 0.02,
        });

        if (ragRes?.citations && ragRes.citations.length > 0) {
          for (const r of ragRes.citations) {
            const ref = r.canonicalReference || `${domain.toUpperCase()}`;
            if (!seenRefs.has(ref)) {
              seenRefs.add(ref);
              sourcePassages.push({
                canonicalReference: ref,
                title: r.documentTitle || `${domain.toUpperCase()} Canonical Scripture`,
                author: r.author,
                text: r.snippet,
              });
            }
          }
        }
      } catch {
        // Fallback to direct DB query
      }
    }

    // Supplement with database canonical chunks for the domain if needed
    if (sourcePassages.length < 3 && mongoose.connection?.readyState === 1) {
      try {
        const compatibleDomains: string[] = [domain];
        if (domain === 'yoga') compatibleDomains.push('classical_texts', 'yoga');
        if (domain === 'gita') compatibleDomains.push('mahabharata', 'gita');

        const queryObj: any = {
          $or: [{ 'metadata.domain': { $in: compatibleDomains } }],
        };
        if (topic && topic !== `${domain.toUpperCase()} Wisdom`) {
          const escaped = topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          queryObj.$or.push({ text: new RegExp(escaped, 'i') });
        }

        const dbChunks = await DocumentChunkModel.find(queryObj)
          .limit(Math.max(20, questionCount * 2))
          .lean()
          .exec();
        for (const c of dbChunks) {
          const meta = (c.metadata as any) || {};
          const ref = c.canonicalReference || meta.focus || `${domain.toUpperCase()}`;
          if (!seenRefs.has(ref)) {
            seenRefs.add(ref);
            sourcePassages.push({
              canonicalReference: ref,
              title: meta.title || `${domain.toUpperCase()} Scripture`,
              author: meta.author,
              text: c.text,
            });
          }
        }
      } catch {
        // Continue
      }
    }

    // If still no direct document chunks found, provide canonical authentic reference passages from domain question banks
    if (sourcePassages.length === 0) {
      const bank = DYNAMIC_QUESTION_BANKS[domain] || DYNAMIC_QUESTION_BANKS.general;
      for (const q of bank.slice(0, 6)) {
        sourcePassages.push({
          canonicalReference: q.sourceRef || `${domain.toUpperCase()}`,
          title: `${domain.toUpperCase()} Canonical Wisdom`,
          text: `${q.questionText} ${q.explanation}`,
        });
      }
    }

    // 2. Generate questions grounded strictly in retrieved source material
    let generatedQuestions: QuizQuestionDTO[] = [];

    if (this.aiProvider) {
      try {
        const sourceContext = sourcePassages
          .map(
            (p, i) =>
              `[Passage ${i + 1}] (${p.canonicalReference} - ${p.title}${p.author ? ` by ${p.author}` : ''}):\n${p.text}`
          )
          .join('\n\n');

        const prompt = `You are an authentic Vedic and ancient Indian scripture scholar.
Generate an interactive multiple choice quiz with exactly ${questionCount} questions at "${difficulty}" difficulty level.

STRICT GROUNDING REQUIREMENT:
Every single question, option, correct answer, and explanation MUST be strictly and exclusively supported by the retrieved authentic source passages below. Do NOT fabricate outside facts, verses, or imaginary citations.
The sourceRef MUST match one of the exact canonical references given in the passages (e.g. BG 2.47, Charaka Samhita Sutra 1.41, Yoga Sutras 1.2, Arthashastra 1.7.1).
Provide 4 distinct options per question. Specify zero-based correctIndex (0 to 3).

Retrieved Authentic Source Passages:
${sourceContext}

Format the response strictly as valid JSON array of objects without markdown backticks:
[
  {
    "questionText": "Question string?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear textual and philosophical explanation",
    "sourceRef": "Canonical citation from the passage"
  }
]`;

        const responseText = await this.aiProvider.generateCompletion([
          { role: 'system', content: 'You are an authoritative Sanskrit and Vedic scholar.' },
          { role: 'user', content: prompt },
        ]);

        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const seenQTexts = new Set<string>();

            for (const item of parsed) {
              const qText = String(item.questionText || '').trim();
              const lowerQ = qText.toLowerCase();

              if (!seenQTexts.has(lowerQ) && Array.isArray(item.options) && item.options.length >= 2) {
                seenQTexts.add(lowerQ);
                generatedQuestions.push({
                  questionIndex: generatedQuestions.length,
                  questionText: qText,
                  options: item.options.map(String),
                  correctIndex:
                    typeof item.correctIndex === 'number' &&
                    item.correctIndex >= 0 &&
                    item.correctIndex < item.options.length
                      ? item.correctIndex
                      : 0,
                  explanation: String(item.explanation || 'Grounded in retrieved canonical passage.').trim(),
                  sourceRef: item.sourceRef
                    ? String(item.sourceRef).trim()
                    : sourcePassages[generatedQuestions.length % sourcePassages.length]?.canonicalReference,
                });
              }

              if (generatedQuestions.length >= questionCount) break;
            }
          }
        }
      } catch {
        // Fallback to grounded bank
      }
    }

    // Ensure the requested question count is strictly satisfied.
    // If AI generation yielded fewer questions than requested, supplement from canonical domain banks.
    if (generatedQuestions.length < questionCount) {
      const bank = DYNAMIC_QUESTION_BANKS[domain] || DYNAMIC_QUESTION_BANKS.general;
      const seenTexts = new Set(generatedQuestions.map((q) => q.questionText.toLowerCase().trim()));

      for (const q of bank) {
        if (generatedQuestions.length >= questionCount) break;
        const normText = q.questionText.toLowerCase().trim();
        if (!seenTexts.has(normText)) {
          seenTexts.add(normText);
          generatedQuestions.push({
            ...q,
            questionIndex: generatedQuestions.length,
            sourceRef:
              q.sourceRef ||
              sourcePassages[generatedQuestions.length % (sourcePassages.length || 1)]?.canonicalReference,
          });
        }
      }

      if (generatedQuestions.length < questionCount) {
        const genBank = DYNAMIC_QUESTION_BANKS.general;
        for (const q of genBank) {
          if (generatedQuestions.length >= questionCount) break;
          const normText = q.questionText.toLowerCase().trim();
          if (!seenTexts.has(normText)) {
            seenTexts.add(normText);
            generatedQuestions.push({
              ...q,
              questionIndex: generatedQuestions.length,
              sourceRef:
                q.sourceRef ||
                sourcePassages[generatedQuestions.length % (sourcePassages.length || 1)]?.canonicalReference,
            });
          }
        }
      }
    }

    // If source data cannot support requested count, explain limitation explicitly
    if (generatedQuestions.length < questionCount) {
      throw new BadRequestError(
        `Unable to generate the requested ${questionCount} questions from the current knowledge base (only ${generatedQuestions.length} valid grounded questions could be generated). Please select a broader topic or lower question count.`
      );
    }

    // Ensure sequential 0-based question indices
    generatedQuestions = generatedQuestions.map((q, idx) => ({
      ...q,
      questionIndex: idx,
    }));

    const title = `Dynamic Quiz: ${input.topic ? input.topic.trim() : `${domain.toUpperCase()} Wisdom`} (${difficulty.toUpperCase()})`;
    const description = `Interactive custom assessment created from topic "${topic}", testing understanding of ${domain.toUpperCase()} concepts, verses, and practical wisdom.`;

    const savedQuiz = await this.quizRepo.createQuiz({
      title,
      description,
      domain,
      difficulty,
      questions: generatedQuestions,
      tags: [
        domain,
        'user-created',
        'custom',
        'your-quiz',
        'dynamic-rag',
        difficulty,
        ...topic.toLowerCase().split(/\s+/).slice(0, 3),
      ],
      isActive: true,
      isDynamic: true,
    });

    return savedQuiz.toClientDTO();
  }
}
