import mongoose from 'mongoose';
import { Logger } from '@ai-gurukul/logging';

export interface DatabaseConnectionOptions {
  uri: string;
  logger: Logger;
}

export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private isConnected = false;
  private uri: string;
  private logger: Logger;

  private constructor(options: DatabaseConnectionOptions) {
    this.uri = options.uri;
    this.logger = options.logger.child({ module: 'DatabaseService' });
    this.setupListeners();
  }

  public static getInstance(options?: DatabaseConnectionOptions): DatabaseService {
    if (!DatabaseService.instance) {
      if (!options) {
        throw new Error('DatabaseService must be initialized with options before getting instance');
      }
      DatabaseService.instance = new DatabaseService(options);
    }
    return DatabaseService.instance;
  }

  private setupListeners(): void {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.logger.info('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      this.isConnected = false;
      this.logger.error({ err }, 'MongoDB connection error encountered');
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.logger.warn('MongoDB connection lost. Reconnecting...');
    });
  }

  public async connect(): Promise<typeof mongoose> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      return mongoose;
    }

    try {
      this.logger.info({ uri: this.sanitizeUri(this.uri) }, 'Connecting to MongoDB...');
      await mongoose.connect(this.uri, {
        maxPoolSize: 20,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      this.isConnected = true;
      return mongoose;
    } catch (error) {
      this.isConnected = false;
      this.logger.error({ error }, 'Failed to connect to MongoDB');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected && mongoose.connection.readyState === 0) {
      return;
    }

    try {
      this.logger.info('Closing MongoDB connection gracefully...');
      await mongoose.disconnect();
      this.isConnected = false;
      this.logger.info('MongoDB connection closed');
    } catch (error) {
      this.logger.error({ error }, 'Error while disconnecting from MongoDB');
      throw error;
    }
  }

  public async ping(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        return { healthy: false, latencyMs: Date.now() - start };
      }
      await mongoose.connection.db.admin().ping();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  public get readyState(): number {
    return mongoose.connection.readyState;
  }

  private sanitizeUri(uri: string): string {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  }
}
