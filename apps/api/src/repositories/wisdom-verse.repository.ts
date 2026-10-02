import {
  BaseRepository,
  IWisdomVerseDocument,
  WisdomVerseModel,
  seedCanonicalWisdom,
} from '@ai-gurukul/database';
import { PaginatedResult, PaginationParams, WisdomDomain } from '@ai-gurukul/types';
import { FilterQuery } from 'mongoose';

export class WisdomVerseRepository extends BaseRepository<IWisdomVerseDocument> {
  constructor() {
    super(WisdomVerseModel);
  }

  public async ensureSeeded(): Promise<number> {
    return seedCanonicalWisdom(this.model);
  }

  public async findByCanonicalRef(
    canonicalReference: string
  ): Promise<IWisdomVerseDocument | null> {
    return this.model.findOne({ canonicalReference: canonicalReference.trim() }).exec();
  }

  public async findByDomain(domain: WisdomDomain): Promise<IWisdomVerseDocument[]> {
    return this.model.find({ domain }).exec();
  }

  public async searchVerses(
    query: {
      domain?: WisdomDomain;
      theme?: string;
      search?: string;
    },
    params: PaginationParams = {}
  ): Promise<PaginatedResult<IWisdomVerseDocument>> {
    const filter: FilterQuery<IWisdomVerseDocument> = {};

    if (query.domain) {
      filter.domain = query.domain;
    }

    if (query.theme) {
      filter.themes = { $in: [query.theme.toLowerCase()] };
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { canonicalReference: regex },
        { englishTranslation: regex },
        { commentary: regex },
        { speaker: regex },
      ];
    }

    return this.paginate(filter, params, undefined, { canonicalReference: 1 });
  }

  public async getRelevantVersesForPersona(persona: string): Promise<IWisdomVerseDocument[]> {
    let domain: WisdomDomain = 'gita';
    if (persona === 'chanakya') domain = 'chanakya';
    else if (persona === 'vaidya') domain = 'ayurveda';
    else if (persona === 'patanjali') domain = 'upanishads';

    return this.model.find({ domain }).limit(5).exec();
  }
}
