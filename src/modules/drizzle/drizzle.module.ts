import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import drizzleConfig from './drizzle.config';
import { DrizzleService } from './drizzle.service';

@Module({
  imports: [ConfigModule.forFeature(drizzleConfig)],
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
