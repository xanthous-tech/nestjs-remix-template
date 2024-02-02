import { registerAs } from '@nestjs/config';

export default registerAs('queues', () => ({
  bullmq: {
    prefix: process.env.MQ_PREFIX || 'bullmq',
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB) || 0,
    },
  },
}));
