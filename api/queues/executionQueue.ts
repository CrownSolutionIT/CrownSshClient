import { Queue } from 'bullmq';
import { connection } from '../config/redis.js';

export const executionQueue = new Queue('execution-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 100,
  },
});
