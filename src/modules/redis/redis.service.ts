import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis(configService.get<RedisOptions>('redis.config'));
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.debug('Closing Redis connection...');
    await this.client.quit();
  }
}
