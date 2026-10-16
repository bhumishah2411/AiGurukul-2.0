import { Types } from 'mongoose';
import {
  GamificationProfileModel,
  IGamificationProfileDocument,
  CANONICAL_STARTER_QUESTS,
  CANONICAL_BAZAAR_ITEMS,
} from '@ai-gurukul/database';
import {
  UserGamificationDTO,
  BazaarItemDTO,
  calculateGurukulLevel,
  GurukulLevel,
} from '@ai-gurukul/types';

export class GamificationRepository {
  async getOrCreateProfile(userId: string): Promise<IGamificationProfileDocument> {
    const objectId = new Types.ObjectId(userId);
    let profile = await GamificationProfileModel.findOne({ userId: objectId });

    if (!profile) {
      // Seed default active quests for the new user
      const starterQuests = CANONICAL_STARTER_QUESTS.map((q) => ({
        questId: q.id,
        code: q.code,
        title: q.title,
        description: q.description,
        category: q.category,
        rewardXp: q.rewardXp,
        rewardCoins: q.rewardCoins,
        rewardBadge: q.rewardBadge,
        targetCount: q.targetCount,
        currentCount: 0,
        status: 'available',
      }));

      profile = await GamificationProfileModel.create({
        userId: objectId,
        xp: 0,
        coins: 100, // Welcome coins
        level: 'Seeker',
        stats: {
          questsCompleted: 0,
          puzzlesSolved: 0,
          itemsPurchased: 0,
          streakDays: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
        },
        badges: ['Sadhaka Initiation'],
        inventory: [],
        activeQuests: starterQuests,
        puzzleHistory: [],
      });
    }

    return profile;
  }

  async updateXpAndCoins(
    userId: string,
    xpDelta: number,
    coinsDelta: number
  ): Promise<{
    profile: IGamificationProfileDocument;
    leveledUp: boolean;
    oldLevel: GurukulLevel;
    newLevel: GurukulLevel;
  }> {
    const profile = await this.getOrCreateProfile(userId);
    const oldLevel = profile.level;

    profile.xp = Math.max(0, profile.xp + xpDelta);
    profile.coins = Math.max(0, profile.coins + coinsDelta);

    const levelInfo = calculateGurukulLevel(profile.xp);
    const leveledUp = levelInfo.level !== oldLevel;
    profile.level = levelInfo.level;

    if (leveledUp && !profile.badges.includes(`Rank: ${levelInfo.level}`)) {
      profile.badges.push(`Rank: ${levelInfo.level}`);
    }

    await profile.save();
    return { profile, leveledUp, oldLevel, newLevel: levelInfo.level };
  }

  async completeQuest(
    userId: string,
    questId: string
  ): Promise<{
    profile: IGamificationProfileDocument;
    rewardXp: number;
    rewardCoins: number;
    rewardBadge?: string;
  }> {
    const profile = await this.getOrCreateProfile(userId);
    const quest = profile.activeQuests.find((q) => q.questId === questId || q.code === questId);

    if (!quest) {
      throw new Error(`Quest with ID ${questId} not found in user active quests.`);
    }

    if (quest.status === 'claimed') {
      throw new Error(`Quest ${quest.title} has already been claimed.`);
    }

    const rewardXp = quest.rewardXp;
    const rewardCoins = quest.rewardCoins;
    const rewardBadge = quest.rewardBadge;

    quest.status = 'claimed';
    quest.currentCount = quest.targetCount;
    quest.completedAt = new Date();
    quest.claimedAt = new Date();

    profile.xp += rewardXp;
    profile.coins += rewardCoins;
    profile.stats.questsCompleted += 1;

    const levelInfo = calculateGurukulLevel(profile.xp);
    profile.level = levelInfo.level;

    if (rewardBadge && !profile.badges.includes(rewardBadge)) {
      profile.badges.push(rewardBadge);
    }

    await profile.save();
    return { profile, rewardXp, rewardCoins, rewardBadge };
  }

  async buyBazaarItem(userId: string, item: BazaarItemDTO): Promise<IGamificationProfileDocument> {
    const profile = await this.getOrCreateProfile(userId);

    if (profile.coins < item.price) {
      throw new Error(
        `Insufficient coins. Item costs ${item.price} coins, but you have ${profile.coins}.`
      );
    }

    profile.coins -= item.price;
    profile.stats.itemsPurchased += 1;

    // Check if already in inventory
    const existing = profile.inventory.find((i) => i.itemId === item.id || i.code === item.code);
    if (existing) {
      existing.quantity += 1;
    } else {
      profile.inventory.push({
        itemId: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        rarity: item.rarity,
        icon: item.icon,
        description: item.description,
        acquiredAt: new Date(),
        quantity: 1,
        isEquipped: false,
      });
    }

    if (!profile.badges.includes('Bazaar Patron')) {
      profile.badges.push('Bazaar Patron');
    }

    await profile.save();
    return profile;
  }

  async equipItem(
    userId: string,
    itemId: string,
    equip: boolean = true
  ): Promise<IGamificationProfileDocument> {
    const profile = await this.getOrCreateProfile(userId);
    const item = profile.inventory.find((i) => i.itemId === itemId || i.code === itemId);

    if (!item) {
      throw new Error(`Item with ID ${itemId} not found in inventory.`);
    }

    item.isEquipped = equip;
    await profile.save();
    return profile;
  }

  async recordPuzzleCompletion(
    userId: string,
    record: {
      puzzleId: string;
      category: string;
      moves: number;
      hintsUsed: number;
      timeSeconds: number;
      score: number;
      earnedXp: number;
      earnedCoins: number;
    }
  ): Promise<{
    profile: IGamificationProfileDocument;
    leveledUp: boolean;
    newLevel: GurukulLevel;
  }> {
    const profile = await this.getOrCreateProfile(userId);
    const oldLevel = profile.level;

    profile.puzzleHistory.push({
      puzzleId: record.puzzleId,
      category: record.category,
      moves: record.moves,
      hintsUsed: record.hintsUsed,
      timeSeconds: record.timeSeconds,
      score: record.score,
      completedAt: new Date(),
    });

    profile.stats.puzzlesSolved += 1;
    profile.xp += record.earnedXp;
    profile.coins += record.earnedCoins;

    const levelInfo = calculateGurukulLevel(profile.xp);
    const leveledUp = levelInfo.level !== oldLevel;
    profile.level = levelInfo.level;

    if (!profile.badges.includes('Mandala Weaver')) {
      profile.badges.push('Mandala Weaver');
    }

    // Update quest progress for jigsaw puzzle quest if present
    const jigsawQuest = profile.activeQuests.find(
      (q) => q.code === 'jigsaw_lore_puzzle' && q.status === 'available'
    );
    if (jigsawQuest) {
      jigsawQuest.currentCount = Math.min(jigsawQuest.targetCount, jigsawQuest.currentCount + 1);
      if (jigsawQuest.currentCount >= jigsawQuest.targetCount) {
        jigsawQuest.status = 'completed';
        jigsawQuest.completedAt = new Date();
      }
    }

    await profile.save();
    return { profile, leveledUp, newLevel: levelInfo.level };
  }
}
