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
import { Types } from 'mongoose';

// Domain question repository for dynamic generation fallback
const DYNAMIC_QUESTION_BANKS: Record<QuizDomain, QuizQuestionDTO[]> = {
  gita: [
    {
      questionText: 'According to the Bhagavad Gita, what is the meaning of "Nishkama Karma"?',
      options: [
        'Action performed with desire for heaven',
        'Action dedicated without selfish attachment to the outcome',
        'Renouncing all forms of work and living in isolation',
        'Performing action only under legal compulsion',
      ],
      correctIndex: 1,
      explanation:
        'Nishkama Karma (BG 2.47) refers to selfless action performed purely as an offering to Dharma without anxiety for selfish rewards.',
      sourceRef: 'Bhagavad Gita 2.47',
    },
    {
      questionText:
        'In Chapter 2 of the Bhagavad Gita, how does Sri Krishna describe the soul (Atman)?',
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
      questionText:
        'Which strategy in the Upayas (four expedients) involves negotiation and peaceful alliance?',
      options: ['Sama', 'Dana', 'Bheda', 'Danda'],
      correctIndex: 0,
      explanation:
        'Sama refers to peaceful persuasion, diplomacy, conciliation, and respectful dialogue.',
      sourceRef: 'Arthashastra 2.10',
    },
    {
      questionText:
        'What does Chanakya warn regarding trusting an untrusted individual or excess trust in friends?',
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
  ],
  upanishads: [
    {
      questionText:
        'What is the central ontological assertion of the Chandogya Upanishad\'s "Tat Tvam Asi"?',
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
  ],
  mahabharata: [
    {
      questionText:
        'Who was granted divine vision (Divya Drishti) by Sage Vyasa to narrate the battlefield events to Dhritarashtra?',
      options: ['Vidura', 'Sanjaya', 'Kripacharya', 'Dronacharya'],
      correctIndex: 1,
      explanation:
        'Sanjaya was blessed with Divya Drishti by Vyasa to witness and report everything transpiring at Kurukshetra.',
      sourceRef: 'Mahabharata Bhishma Parva',
    },
    {
      questionText:
        'What was the central ethical dilemma confronted by Yudhishthira at the Yaksha Prashna?',
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
      questionText:
        "In Valmiki Ramayana, which sage narrates the original epic story to Rama's twin sons Lava and Kusha?",
      options: ['Sage Valmiki', 'Sage Vishvamitra', 'Sage Vasishtha', 'Sage Agastya'],
      correctIndex: 0,
      explanation:
        'Sage Valmiki, the Adi Kavi (first poet), authored the Ramayana and taught it to Lava and Kusha in his hermitage.',
      sourceRef: 'Valmiki Ramayana Bala Kanda',
    },
  ],
  panchatantra: [
    {
      questionText:
        'Who is the traditional scholar credited with authoring the Panchatantra fables to educate princes in statecraft (Niti)?',
      options: ['Pandit Vishnu Sharma', 'Kalidasa', 'Bhavabhuti', 'Banabhatta'],
      correctIndex: 0,
      explanation:
        'Pandit Vishnu Sharma created the animal fables in five tantras (books) to impart wisdom and practical life discernment to three young princes.',
      sourceRef: 'Panchatantra Kathamukha',
    },
    {
      questionText:
        'What is the overarching moral taught in the story of the talkative turtle and the two geese?',
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
  ],
  general: [
    {
      questionText:
        'What are the four Purusharthas (legitimate goals of human life) recognized in classical Indian philosophy?',
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
      questionText:
        'What is the literal translation and philosophical meaning of "Sat-Chit-Ananda"?',
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
  ],
};

export class QuizService {
  private quizRepo: QuizRepository;
  private attemptRepo: QuizAttemptRepository;
  private aiProvider?: AIProvider;

  constructor(
    quizRepo: QuizRepository,
    attemptRepo: QuizAttemptRepository,
    aiProvider?: AIProvider
  ) {
    this.quizRepo = quizRepo;
    this.attemptRepo = attemptRepo;
    this.aiProvider = aiProvider;
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
    const domain = input.domain || 'gita';
    const difficulty = input.difficulty || 'intermediate';
    const questionCount = Math.min(10, Math.max(1, input.questionCount || 5));
    const topic = input.topic ? input.topic.trim() : `${domain.toUpperCase()} Wisdom`;

    let generatedQuestions: QuizQuestionDTO[] = [];

    // Attempt AI Generation if AIProvider is configured
    if (this.aiProvider) {
      try {
        const prompt = `You are a Vedic Scholar and AI Gurukul Sage. Generate a JSON quiz with exactly ${questionCount} multiple choice questions on the domain "${domain}" focusing on "${topic}" with difficulty level "${difficulty}".
Format the response strictly as valid JSON array of question objects without markdown backticks:
[
  {
    "questionText": "Question string?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear philosophical and textual explanation",
    "sourceRef": "Textual Chapter and Verse citation (e.g. BG 2.47)"
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
            generatedQuestions = parsed.slice(0, questionCount).map((item, idx) => ({
              questionIndex: idx,
              questionText: String(item.questionText || `Question ${idx + 1}`),
              options:
                Array.isArray(item.options) && item.options.length >= 2
                  ? item.options
                  : ['Yes', 'No'],
              correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
              explanation: String(item.explanation || 'Vedic wisdom explanation.'),
              sourceRef: item.sourceRef ? String(item.sourceRef) : undefined,
            }));
          }
        }
      } catch {
        // Fallback gracefully to curated bank
      }
    }

    // Fallback if AI was unavailable or did not return valid JSON
    if (generatedQuestions.length === 0) {
      const bank = DYNAMIC_QUESTION_BANKS[domain] || DYNAMIC_QUESTION_BANKS.general;
      const shuffled = [...bank].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, questionCount);

      // If bank had fewer than requested, fill with general bank
      if (selected.length < questionCount && domain !== 'general') {
        const genBank = [...DYNAMIC_QUESTION_BANKS.general].sort(() => 0.5 - Math.random());
        while (selected.length < questionCount && genBank.length > 0) {
          selected.push(genBank.pop()!);
        }
      }

      generatedQuestions = selected.map((q, idx) => ({
        ...q,
        questionIndex: idx,
      }));
    }

    const title = `Dynamic Quiz: ${topic} (${difficulty.toUpperCase()})`;
    const description = `AI-generated interactive quiz testing understanding of ${domain.toUpperCase()} concepts, verses, and practical wisdom.`;

    const savedQuiz = await this.quizRepo.createQuiz({
      title,
      description,
      domain,
      difficulty,
      questions: generatedQuestions,
      tags: [domain, 'dynamic-ai', difficulty, ...topic.toLowerCase().split(/\s+/).slice(0, 3)],
      isActive: true,
      isDynamic: true,
    });

    return savedQuiz.toClientDTO();
  }
}
