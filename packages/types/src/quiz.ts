export type QuizDomain =
  | 'gita'
  | 'chanakya'
  | 'upanishads'
  | 'ayurveda'
  | 'mahabharata'
  | 'ramayana'
  | 'panchatantra'
  | 'general';

export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface QuizQuestionDTO {
  questionIndex?: number;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef?: string;
}

export interface QuizQuestionClientDTO {
  questionIndex: number;
  questionText: string;
  options: string[];
  sourceRef?: string;
}

export interface QuizDTO {
  id: string;
  title: string;
  description?: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  questions: QuizQuestionDTO[];
  tags: string[];
  isActive: boolean;
  isDynamic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizClientDTO {
  id: string;
  title: string;
  description?: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  totalQuestions: number;
  questions: QuizQuestionClientDTO[];
  tags: string[];
  isDynamic?: boolean;
  createdAt?: string;
}

export interface QuizSummaryDTO {
  id: string;
  title: string;
  description?: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  questionCount: number;
  tags: string[];
  isActive: boolean;
  isDynamic?: boolean;
  createdAt?: string;
}

export interface CreateQuizDTO {
  title: string;
  description?: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  questions: QuizQuestionDTO[];
  tags?: string[];
  isActive?: boolean;
  isDynamic?: boolean;
}

export interface SubmitQuizAnswerInput {
  questionIndex: number;
  selectedIndex: number;
}

export interface SubmitQuizAttemptInput {
  quizId: string;
  answers: SubmitQuizAnswerInput[];
  timeSpentSeconds?: number;
}

export interface QuizAttemptAnswerResult {
  questionIndex: number;
  questionText: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  sourceRef?: string;
}

export interface QuizAttemptDTO {
  id: string;
  userId?: string;
  quizId: string;
  quizTitle: string;
  domain: QuizDomain;
  difficulty: QuizDifficulty;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: QuizAttemptAnswerResult[];
  weakAreas: string[];
  timeSpentSeconds?: number;
  completedAt: string;
}

export interface GenerateDynamicQuizInput {
  domain: QuizDomain;
  topic?: string;
  difficulty?: QuizDifficulty;
  questionCount?: number;
  language?: 'en' | 'hi' | 'sa';
}

export interface QuizFilterParams {
  domain?: QuizDomain;
  difficulty?: QuizDifficulty;
  tag?: string;
  search?: string;
  limit?: number;
  page?: number;
}
