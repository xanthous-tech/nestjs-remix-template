import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export default registerAs('redis', (): { config: RedisOptions } => ({
  config: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB) || 0,
  },
}));
