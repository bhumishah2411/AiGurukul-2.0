import {
  AyurvedaProfileDTO,
  AyurvedaQuestion,
  AyurvedaRecommendation,
  DoshaConstitutionType,
  DoshaType,
  PrakritiAnswerInput,
  PrakritiScore,
} from '@ai-gurukul/types';
import { AyurvedaProfileRepository } from '../repositories/ayurveda-profile.repository.js';
import {
  AYURVEDA_QUESTIONNAIRE,
  AYURVEDA_RECOMMENDATIONS_CATALOG,
  SYMPTOM_DOSHA_MAPPING,
} from './ayurveda-knowledge.js';
import { BadRequestError, NotFoundError } from '@ai-gurukul/types';

export class AyurvedaService {
  private profileRepo: AyurvedaProfileRepository;

  constructor(profileRepo: AyurvedaProfileRepository) {
    this.profileRepo = profileRepo;
  }

  public getQuestionnaire(): AyurvedaQuestion[] {
    return AYURVEDA_QUESTIONNAIRE;
  }

  public getSymptomCatalog(): Array<{ id: string; label: string; dosha: DoshaType }> {
    return Object.entries(SYMPTOM_DOSHA_MAPPING).map(([id, info]) => ({
      id,
      label: info.label,
      dosha: info.dosha,
    }));
  }

  public calculatePrakriti(answers: PrakritiAnswerInput[]): PrakritiScore {
    const questionMap = new Map(AYURVEDA_QUESTIONNAIRE.map((q) => [q.id, q]));

    let vataCount = 0;
    let pittaCount = 0;
    let kaphaCount = 0;
    let validAnswersCount = 0;

    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) continue;

      const option = question.options.find((opt) => opt.id === ans.selectedOptionId);
      if (!option) continue;

      if (option.dosha === 'vata') vataCount++;
      else if (option.dosha === 'pitta') pittaCount++;
      else if (option.dosha === 'kapha') kaphaCount++;

      validAnswersCount++;
    }

    if (validAnswersCount === 0) {
      throw new BadRequestError('No valid answers were submitted for Prakriti calculation');
    }

    // Convert counts to normalized percentages summing to exactly 100%
    const vataPct = Math.round((vataCount / validAnswersCount) * 100);
    const pittaPct = Math.round((pittaCount / validAnswersCount) * 100);
    const kaphaPct = 100 - (vataPct + pittaPct);

    // Determine constitution
    const scores = [
      { dosha: 'vata' as DoshaType, score: vataPct },
      { dosha: 'pitta' as DoshaType, score: pittaPct },
      { dosha: 'kapha' as DoshaType, score: kaphaPct },
    ].sort((a, b) => b.score - a.score);

    const highest = scores[0];
    const second = scores[1];
    const third = scores[2];

    let dominantDosha: DoshaConstitutionType;
    let secondaryDosha: DoshaType | undefined;

    // Tridoshic: all 3 doshas within 7% of each other
    if (highest.score - third.score <= 7) {
      dominantDosha = 'tridoshic';
    }
    // Single dosha dominant: high score >= 48% with significant margin >= 14%
    else if (highest.score >= 48 && highest.score - second.score >= 14) {
      dominantDosha = highest.dosha;
    }
    // Dual dosha (Dvandvaja)
    else {
      const pair = [highest.dosha, second.dosha].sort();
      if (pair.includes('vata') && pair.includes('pitta')) {
        dominantDosha = 'vata-pitta';
      } else if (pair.includes('pitta') && pair.includes('kapha')) {
        dominantDosha = 'pitta-kapha';
      } else {
        dominantDosha = 'vata-kapha';
      }
      secondaryDosha = second.dosha;
    }

    return {
      vata: vataPct,
      pitta: pittaPct,
      kapha: kaphaPct,
      dominantDosha,
      secondaryDosha,
    };
  }

  public evaluateSymptoms(symptoms: string[]): DoshaType[] {
    const counts: Record<DoshaType, number> = { vata: 0, pitta: 0, kapha: 0 };

    for (const symptomId of symptoms) {
      const mapping = SYMPTOM_DOSHA_MAPPING[symptomId];
      if (mapping) {
        counts[mapping.dosha]++;
      }
    }

    const elevated: DoshaType[] = [];
    const maxCount = Math.max(counts.vata, counts.pitta, counts.kapha);

    if (maxCount === 0) return [];

    // Any dosha with at least 2 symptoms or equal to maximum count is considered elevated
    for (const [dosha, count] of Object.entries(counts)) {
      if (count > 0 && (count >= 2 || count === maxCount)) {
        elevated.push(dosha as DoshaType);
      }
    }

    return elevated;
  }

  public generateRecommendations(
    prakriti: PrakritiScore,
    currentImbalances: DoshaType[] = []
  ): AyurvedaRecommendation[] {
    const result: AyurvedaRecommendation[] = [];
    const seenIds = new Set<string>();

    // 1. If acute imbalances exist, prioritize balance for elevated doshas
    const primaryDoshasToAddress =
      currentImbalances.length > 0
        ? currentImbalances
        : prakriti.dominantDosha === 'tridoshic'
          ? (['vata', 'pitta', 'kapha'] as DoshaType[])
          : prakriti.dominantDosha.includes('-')
            ? (prakriti.dominantDosha.split('-') as DoshaType[])
            : [prakriti.dominantDosha as DoshaType];

    for (const dosha of primaryDoshasToAddress) {
      const recommendations = AYURVEDA_RECOMMENDATIONS_CATALOG[dosha] || [];
      for (const rec of recommendations) {
        if (!seenIds.has(rec.id)) {
          result.push(rec);
          seenIds.add(rec.id);
        }
      }
    }

    return result;
  }

  public async submitPrakritiAssessment(
    userId: string,
    answers: PrakritiAnswerInput[]
  ): Promise<AyurvedaProfileDTO> {
    const prakriti = this.calculatePrakriti(answers);
    const existingProfile = await this.profileRepo.findByUserId(userId);
    const currentImbalances = existingProfile?.currentImbalances || [];

    const recommendations = this.generateRecommendations(prakriti, currentImbalances);

    const updatedDoc = await this.profileRepo.upsertProfile(userId, {
      prakriti,
      currentImbalances,
      recommendations,
    });

    return updatedDoc.toDTO();
  }

  public async logSymptoms(
    userId: string,
    symptoms: string[],
    notes?: string
  ): Promise<AyurvedaProfileDTO> {
    const elevatedDoshas = this.evaluateSymptoms(symptoms);
    let profileDoc = await this.profileRepo.findByUserId(userId);

    // If profile doesn't exist yet, create a default balanced baseline
    if (!profileDoc) {
      profileDoc = await this.profileRepo.upsertProfile(userId, {
        prakriti: {
          vata: 34,
          pitta: 33,
          kapha: 33,
          dominantDosha: 'tridoshic',
        },
        currentImbalances: elevatedDoshas,
      });
    }

    const updatedDoc = await this.profileRepo.addVikritiLog(userId, {
      symptoms,
      elevatedDoshas,
      notes,
    });

    if (!updatedDoc) {
      throw new NotFoundError('Failed to update Ayurveda profile with symptom log');
    }

    // Refresh recommendations based on newly elevated imbalances
    const recommendations = this.generateRecommendations(updatedDoc.prakriti, elevatedDoshas);
    updatedDoc.recommendations = recommendations;
    await updatedDoc.save();

    return updatedDoc.toDTO();
  }

  public async getProfile(userId: string): Promise<AyurvedaProfileDTO | null> {
    const profileDoc = await this.profileRepo.findByUserId(userId);
    return profileDoc ? profileDoc.toDTO() : null;
  }
}
