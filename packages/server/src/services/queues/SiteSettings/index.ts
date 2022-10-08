/* eslint-disable no-console */
import {
  Queue,
  QueueScheduler,
  Worker,
  JobsOptions,
  QueueBaseOptions,
  Job,
} from 'bullmq';
import { omit } from 'lodash';
import { SettingsJobCode, SettingsJobResponse, Settings } from 'types';
import setSettings from './worker';
import { QueueLogger } from '../../Logger';
import SettingsService from '../../../modules/settings/SettingsService';
import { redisPort } from '../../../configs/server.config.json';

export default class SettingsSetter {
  readonly QUEUE_NAME = 'SettingsSetter';

  readonly JOB_NAMES = ['switch-site-is-active'] as const;

  private readonly redisConnection: QueueBaseOptions = {
    connection: {
      port: redisPort,
    },
  };

  private queue: Queue<null, SettingsJobResponse, SettingsJobCode>;

  private queueScheduler: QueueScheduler;

  private worker: Worker<null, SettingsJobResponse, 'switch-site-is-active'>;

  constructor() {
    this.queueScheduler = new QueueScheduler(this.QUEUE_NAME, this.redisConnection);
    this.queue = new Queue<null, SettingsJobResponse, SettingsJobCode>(
      this.QUEUE_NAME,
      this.redisConnection,
    );
    /**
     * TODO: replace with sandbox mode
     * const processorFile = path.join(__dirname, 'worker.js');
     * const worker = new Worker(QUEUE_NAME, processorFile, redisConnection);
     */
    this.worker = new Worker(this.QUEUE_NAME, setSettings, this.redisConnection);

    this.worker.on('completed', (job: Job) => {
      console.log('completed queue', job.name);
      QueueLogger.info('completed', omit(job, 'queue'));
    });

    this.worker.on('progress', (job: Job) => {
      QueueLogger.info('progress', omit(job, 'queue'));
    });

    this.worker.on('failed', (job: Job) => {
      console.log('failed queue', job.name);
      QueueLogger.error('failed', omit(job, 'queue'));
    });
  }

  async run(): Promise<void> {
    const settings = await SettingsService.getSettings();
    await this.restartQueue(settings);
    SettingsService.on('update', this.restartQueue.bind(this));
  }

  private async restartQueue(settings: Settings): Promise<void> {
    // LINK: https://docs.bullmq.io/guide/jobs/repeatable
    // Here, 1000 = 1 second
    const time = settings.siteIsActive ? 1 : 2;
    const repetitionTime = time * 60 * 1000;
    console.log(`Restarting queue. It will repeat on each ${repetitionTime / 1000} seconds.`);
    const jobOption: JobsOptions = {
      repeat: {
        every: repetitionTime,
      },
      removeOnComplete: true,
    };

    try {
      const existingJobs = await this.queue.getRepeatableJobs();
      for (const existingJob of existingJobs) {
        await this.queue.removeRepeatableByKey(existingJob.key);
      }
      await Promise.all(
        this.JOB_NAMES.map((name) => this.queue.add(name, null, jobOption)),
      );
    } catch (error) {
      QueueLogger.error(error);
    }
  }
}
