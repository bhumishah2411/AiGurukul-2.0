import { Worker, Job, WorkerOptions } from 'bullmq';
import { Logger } from '@ai-gurukul/logging';
import Redis from 'ioredis';

export abstract class BaseWorkerService<DataType, ReturnType> {
  protected worker: Worker<DataType, ReturnType>;
  protected logger: Logger;
  public readonly queueName: string;

  constructor(
    queueName: string,
    redisConnection: Redis,
    logger: Logger,
    options?: Partial<WorkerOptions>
  ) {
    this.queueName = queueName;
    this.logger = logger.child({ module: `Worker:${queueName}` });

    this.worker = new Worker<DataType, ReturnType>(
      queueName,
      async (job: Job<DataType, ReturnType>) => {
        const correlationId = (job.data as Record<string, unknown>)?.correlationId || job.id;
        const jobLogger = this.logger.child({ jobId: job.id, jobName: job.name, correlationId });

        jobLogger.info('Starting job execution');
        const start = Date.now();

        try {
          const result = await this.processJob(job, jobLogger);
          jobLogger.info({ durationMs: Date.now() - start }, 'Job completed successfully');
          return result;
        } catch (error) {
          jobLogger.error({ error, durationMs: Date.now() - start }, 'Job execution failed');
          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: options?.concurrency ?? 3,
        ...options,
      }
    );

    this.setupListeners();
  }

  protected abstract processJob(
    job: Job<DataType, ReturnType>,
    jobLogger: Logger
  ): Promise<ReturnType>;

  private setupListeners(): void {
    this.worker.on('failed', (job, err) => {
      this.logger.error(
        { jobId: job?.id, err },
        `Job permanently failed in queue: ${this.queueName}`
      );
    });

    this.worker.on('error', (err) => {
      this.logger.error({ err }, `Worker error in queue: ${this.queueName}`);
    });
  }

  public async close(): Promise<void> {
    this.logger.info(`Shutting down worker for queue: ${this.queueName}`);
    await this.worker.close();
  }
}
