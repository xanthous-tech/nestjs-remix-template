import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DrizzleModule } from '@/modules/drizzle';
import authConfig from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule.forFeature(authConfig), DrizzleModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
