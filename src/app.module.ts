import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './app.config';
import { AppService } from './app.service';
import { QueuesModule } from './modules/queues';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      // mimic behaviors from nextjs
      envFilePath: ['.env', `.env.${ENV}`, `.env.${ENV}.local`, '.env.local'],
      load: [appConfig],
    }),
    QueuesModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
