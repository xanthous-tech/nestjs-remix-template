import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth';
import { QueuesModule } from './modules/queues';
import appConfig from './app.config';
import { AppService } from './app.service';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      // mimic behaviors from nextjs
      envFilePath: ['.env', `.env.${ENV}`, `.env.${ENV}.local`, '.env.local'],
      load: [appConfig],
    }),
    AuthModule,
    QueuesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
