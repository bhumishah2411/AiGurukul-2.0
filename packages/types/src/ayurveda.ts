export type DoshaType = 'vata' | 'pitta' | 'kapha';

export type DoshaConstitutionType =
  'vata' | 'pitta' | 'kapha' | 'vata-pitta' | 'pitta-kapha' | 'vata-kapha' | 'tridoshic';

export interface PrakritiScore {
  vata: number;
  pitta: number;
  kapha: number;
  dominantDosha: DoshaConstitutionType;
  secondaryDosha?: DoshaType;
}

export type AyurvedaQuestionCategory = 'physical' | 'physiological' | 'psychological';

export interface AyurvedaQuestionOption {
  id: string;
  text: string;
  dosha: DoshaType;
  description?: string;
}

export interface AyurvedaQuestion {
  id: string;
  category: AyurvedaQuestionCategory;
  question: string;
  explanation?: string;
  options: AyurvedaQuestionOption[];
}

export type AyurvedaRecommendationCategory =
  'diet' | 'routine' | 'herbs' | 'seasonal' | 'lifestyle';

export interface AyurvedaRecommendation {
  id: string;
  category: AyurvedaRecommendationCategory;
  title: string;
  guidance: string;
  classicalReference?: string;
  benefits: string[];
}

export interface VikritiLogEntry {
  id: string;
  date: string;
  symptoms: string[];
  elevatedDoshas: DoshaType[];
  notes?: string;
}

export interface AyurvedaProfileDTO {
  id: string;
  userId: string;
  prakriti: PrakritiScore;
  currentImbalances: DoshaType[];
  recommendations: AyurvedaRecommendation[];
  recentVikritiLogs: VikritiLogEntry[];
  updatedAt: string;
}

export interface PrakritiAnswerInput {
  questionId: string;
  selectedOptionId: string;
}
