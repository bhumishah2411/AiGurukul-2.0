import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  ProjectionType,
  ClientSession,
} from 'mongoose';
import { PaginatedResult, PaginationParams } from '@ai-gurukul/types';

export abstract class BaseRepository<T extends Document> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async findById(
    id: string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return this.model.findById(id, projection, options).exec();
  }

  public async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).exec();
  }

  public async find(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T[]> {
    return this.model.find(filter, projection, options).exec();
  }

  public async create(
    data: Partial<T> | Record<string, unknown>,
    session?: ClientSession
  ): Promise<T> {
    const docs = await this.model.create([data], { session });
    return docs[0] as T;
  }

  public async updateById(
    id: string,
    update: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true }
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, options).exec();
  }

  public async deleteById(id: string, options?: QueryOptions<T>): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options).exec();
  }

  public async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  public async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter).exec();
    return doc !== null;
  }

  public async paginate(
    filter: FilterQuery<T> = {},
    params: PaginationParams = {},
    projection?: ProjectionType<T>,
    sort: Record<string, 1 | -1> = { createdAt: -1 } as Record<string, 1 | -1>
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.find(filter, projection).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
