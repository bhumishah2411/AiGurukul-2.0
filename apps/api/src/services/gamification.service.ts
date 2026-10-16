import { GamificationRepository } from '../repositories/gamification.repository.js';
import { CANONICAL_BAZAAR_ITEMS, CANONICAL_JIGSAW_PUZZLES } from '@ai-gurukul/database';
import {
  UserGamificationDTO,
  BazaarItemDTO,
  InventoryItemDTO,
  QuestDTO,
  JigsawPuzzleDTO,
  SubmitJigsawRequestDTO,
  JigsawCompletionResultDTO,
  GurukulLevel,
} from '@ai-gurukul/types';

export class GamificationService {
  constructor(private repo: GamificationRepository) {}

  async getProfile(userId: string): Promise<UserGamificationDTO> {
    const doc = await this.repo.getOrCreateProfile(userId);
    return doc.toDTO();
  }

  async awardXpAndCoins(
    userId: string,
    xp: number,
    coins: number = 0,
    _reason?: string
  ): Promise<{ profile: UserGamificationDTO; leveledUp: boolean; newLevel: GurukulLevel }> {
    const { profile, leveledUp, newLevel } = await this.repo.updateXpAndCoins(userId, xp, coins);
    return { profile: profile.toDTO(), leveledUp, newLevel };
  }

  async getQuests(userId: string): Promise<QuestDTO[]> {
    const doc = await this.repo.getOrCreateProfile(userId);
    return doc.toDTO().activeQuests;
  }

  async completeQuest(
    userId: string,
    questId: string
  ): Promise<{
    profile: UserGamificationDTO;
    rewardXp: number;
    rewardCoins: number;
    rewardBadge?: string;
  }> {
    const { profile, rewardXp, rewardCoins, rewardBadge } = await this.repo.completeQuest(
      userId,
      questId
    );
    return {
      profile: profile.toDTO(),
      rewardXp,
      rewardCoins,
      rewardBadge,
    };
  }

  getBazaarItems(): BazaarItemDTO[] {
    return CANONICAL_BAZAAR_ITEMS;
  }

  async buyBazaarItem(
    userId: string,
    itemId: string
  ): Promise<{ profile: UserGamificationDTO; purchasedItem: BazaarItemDTO }> {
    const item = CANONICAL_BAZAAR_ITEMS.find((b) => b.id === itemId || b.code === itemId);
    if (!item) {
      throw new Error(`Bazaar item with ID ${itemId} does not exist in catalog.`);
    }

    const updatedProfileDoc = await this.repo.buyBazaarItem(userId, item);
    return {
      profile: updatedProfileDoc.toDTO(),
      purchasedItem: item,
    };
  }

  async getInventory(userId: string): Promise<InventoryItemDTO[]> {
    const doc = await this.repo.getOrCreateProfile(userId);
    return doc.toDTO().inventory;
  }

  async equipItem(
    userId: string,
    itemId: string,
    equip: boolean = true
  ): Promise<UserGamificationDTO> {
    const updated = await this.repo.equipItem(userId, itemId, equip);
    return updated.toDTO();
  }

  getPuzzles(): JigsawPuzzleDTO[] {
    return CANONICAL_JIGSAW_PUZZLES;
  }

  getPuzzleById(puzzleId: string): JigsawPuzzleDTO {
    const puzzle = CANONICAL_JIGSAW_PUZZLES.find((p) => p.id === puzzleId || p.code === puzzleId);
    if (!puzzle) {
      throw new Error(`Jigsaw puzzle with ID ${puzzleId} not found.`);
    }
    return puzzle;
  }

  async submitJigsawPuzzle(
    userId: string,
    payload: SubmitJigsawRequestDTO
  ): Promise<JigsawCompletionResultDTO> {
    const puzzle = this.getPuzzleById(payload.puzzleId);

    if (!payload.tilePlacements || payload.tilePlacements.length !== 12) {
      throw new Error('Must submit all 12 tile placements for a 3x4 jigsaw grid.');
    }

    // Verify placements: each slot index i should contain tileId i
    let correctlyPlaced = 0;
    for (let i = 0; i < 12; i++) {
      if (payload.tilePlacements[i] === i) {
        correctlyPlaced++;
      }
    }

    const isComplete = correctlyPlaced === 12;
    if (!isComplete) {
      throw new Error(`Puzzle is not fully solved. ${correctlyPlaced}/12 tiles correctly aligned.`);
    }

    // Calculate score, penalties, and rewards
    const hintsPenalty = payload.hintsUsed * puzzle.hintCost;
    const earnedCoins = Math.max(10, puzzle.rewardCoins - hintsPenalty);
    const earnedXp = puzzle.rewardXp;

    const finalScore = Math.max(
      100,
      1000 - payload.moves * 10 - payload.timeSeconds * 2 - payload.hintsUsed * 50
    );

    const { profile, leveledUp, newLevel } = await this.repo.recordPuzzleCompletion(userId, {
      puzzleId: puzzle.id,
      category: puzzle.category,
      moves: payload.moves,
      hintsUsed: payload.hintsUsed,
      timeSeconds: payload.timeSeconds,
      score: finalScore,
      earnedXp,
      earnedCoins,
    });

    const profileDTO = profile.toDTO();

    return {
      success: true,
      earnedXp,
      earnedCoins,
      finalScore,
      hintsPenalty,
      leveledUp,
      newLevel,
      newXp: profileDTO.xp,
      newCoins: profileDTO.coins,
      loreCompletionNotes: puzzle.loreCompletionNotes,
      profile: profileDTO,
    };
  }
}
