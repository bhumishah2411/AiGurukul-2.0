import {
  BaseRepository,
  AyurvedaProfileModel,
  IAyurvedaProfileDocument,
} from '@ai-gurukul/database';
import { Types } from 'mongoose';
import { DoshaType } from '@ai-gurukul/types';

export class AyurvedaProfileRepository extends BaseRepository<IAyurvedaProfileDocument> {
  constructor() {
    super(AyurvedaProfileModel);
  }

  public async findByUserId(userId: string): Promise<IAyurvedaProfileDocument | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  public async upsertProfile(
    userId: string,
    profileData: {
      prakriti: IAyurvedaProfileDocument['prakriti'];
      currentImbalances?: DoshaType[];
      recommendations?: IAyurvedaProfileDocument['recommendations'];
    }
  ): Promise<IAyurvedaProfileDocument> {
    const userObjId = new Types.ObjectId(userId);

    const doc = await this.model
      .findOneAndUpdate(
        { userId: userObjId },
        {
          $set: {
            prakriti: profileData.prakriti,
            currentImbalances: profileData.currentImbalances || [],
            recommendations: profileData.recommendations || [],
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
      .exec();

    return doc as IAyurvedaProfileDocument;
  }

  public async addVikritiLog(
    userId: string,
    logEntry: {
      symptoms: string[];
      elevatedDoshas: DoshaType[];
      notes?: string;
    }
  ): Promise<IAyurvedaProfileDocument | null> {
    const userObjId = new Types.ObjectId(userId);

    return this.model
      .findOneAndUpdate(
        { userId: userObjId },
        {
          $push: {
            vikritiLogs: {
              date: new Date(),
              symptoms: logEntry.symptoms,
              elevatedDoshas: logEntry.elevatedDoshas,
              notes: logEntry.notes,
            },
          },
          $set: {
            currentImbalances: logEntry.elevatedDoshas,
          },
        },
        { new: true }
      )
      .exec();
  }
}
