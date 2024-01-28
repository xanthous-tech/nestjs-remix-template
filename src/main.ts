import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { broadcastDevReady } from '@remix-run/node';

import { injectRemixIntoNest } from './remix';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const appService = app.get(AppService);
  const expressApp = app.getHttpAdapter().getInstance();

  const build = injectRemixIntoNest(expressApp, {
    appService,
  });

  await app.listen(3000);

  if (process.env.NODE_ENV === 'development') {
    await broadcastDevReady(build);
  }
}

bootstrap();
