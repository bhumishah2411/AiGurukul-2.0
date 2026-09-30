import mongoose, { Schema } from 'mongoose';
import { Logger } from '@ai-gurukul/logging';

export interface MigrationScript {
  id: string;
  description?: string;
  up: (db: mongoose.Connection) => Promise<void>;
  down: (db: mongoose.Connection) => Promise<void>;
}

export interface SeedScript {
  id: string;
  description?: string;
  run: (db: mongoose.Connection) => Promise<void>;
}

export interface IMigrationDoc {
  id: string;
  description?: string;
  appliedAt: Date;
  batch: number;
}

const MigrationSchema = new Schema<IMigrationDoc>({
  id: { type: String, required: true, unique: true },
  description: { type: String },
  appliedAt: { type: Date, default: Date.now },
  batch: { type: Number, required: true },
});

export const MigrationModel = mongoose.model<IMigrationDoc>('__migrations', MigrationSchema);

export interface MigrationStatusReport {
  appliedCount: number;
  pendingCount: number;
  applied: IMigrationDoc[];
  pending: string[];
}

export class MigrationRunner {
  private connection: mongoose.Connection;
  private logger: Logger;

  constructor(connection: mongoose.Connection, logger: Logger) {
    this.connection = connection;
    this.logger = logger.child({ module: 'MigrationRunner' });
  }

  public async getStatus(allMigrations: MigrationScript[]): Promise<MigrationStatusReport> {
    const applied = await MigrationModel.find().sort({ batch: 1, appliedAt: 1 }).lean().exec();
    const appliedIds = new Set(applied.map((m) => m.id));
    const pending = allMigrations.filter((m) => !appliedIds.has(m.id)).map((m) => m.id);

    return {
      appliedCount: applied.length,
      pendingCount: pending.length,
      applied,
      pending,
    };
  }

  public async runMigrations(migrations: MigrationScript[]): Promise<void> {
    this.logger.info(`Checking migrations... (${migrations.length} registered)`);

    // Sort deterministically by ID
    const sorted = [...migrations].sort((a, b) => a.id.localeCompare(b.id));

    const status = await this.getStatus(sorted);
    if (status.pendingCount === 0) {
      this.logger.info('No pending migrations found. Database is up to date.');
      return;
    }

    const lastBatch = status.applied.reduce((max, m) => Math.max(max, m.batch), 0);
    const currentBatch = lastBatch + 1;

    for (const migration of sorted) {
      const alreadyApplied = status.applied.some((m) => m.id === migration.id);
      if (alreadyApplied) {
        continue;
      }

      this.logger.info(`Applying migration [Batch ${currentBatch}]: ${migration.id}`);
      const startTime = Date.now();
      try {
        await migration.up(this.connection);
        await MigrationModel.create({
          id: migration.id,
          description: migration.description,
          appliedAt: new Date(),
          batch: currentBatch,
        });
        this.logger.info(`Successfully applied ${migration.id} in ${Date.now() - startTime}ms`);
      } catch (error) {
        this.logger.error(
          { error, migrationId: migration.id },
          `Migration failed: ${migration.id}`
        );
        throw error;
      }
    }

    this.logger.info('All pending migrations executed successfully.');
  }

  public async rollbackLastBatch(migrations: MigrationScript[]): Promise<void> {
    const applied = await MigrationModel.find().sort({ batch: -1 }).lean().exec();
    if (applied.length === 0) {
      this.logger.info('No migrations to roll back.');
      return;
    }

    const lastBatch = applied[0].batch;
    const migrationsToRollback = applied.filter((m) => m.batch === lastBatch);
    const migrationMap = new Map(migrations.map((m) => [m.id, m]));

    this.logger.info(
      `Rolling back Batch ${lastBatch} (${migrationsToRollback.length} migrations)...`
    );

    for (const record of migrationsToRollback) {
      const script = migrationMap.get(record.id);
      if (!script) {
        throw new Error(`Migration script definition for ${record.id} not found.`);
      }

      this.logger.info(`Reverting migration: ${record.id}`);
      await script.down(this.connection);
      await MigrationModel.deleteOne({ id: record.id });
    }

    this.logger.info(`Rollback of Batch ${lastBatch} completed successfully.`);
  }
}

export class SeedRunner {
  private connection: mongoose.Connection;
  private logger: Logger;

  constructor(connection: mongoose.Connection, logger: Logger) {
    this.connection = connection;
    this.logger = logger.child({ module: 'SeedRunner' });
  }

  public async runSeeds(seeds: SeedScript[]): Promise<void> {
    this.logger.info(`Running development seeds... (${seeds.length} registered)`);
    for (const seed of seeds) {
      this.logger.info(`Running seed: ${seed.id}`);
      const start = Date.now();
      try {
        await seed.run(this.connection);
        this.logger.info(`Seed ${seed.id} completed in ${Date.now() - start}ms`);
      } catch (error) {
        this.logger.error({ error, seedId: seed.id }, `Seed failed: ${seed.id}`);
        throw error;
      }
    }
    this.logger.info('All seeds executed.');
  }
}
