import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { broadcastDevReady } from '@remix-run/node';

import { injectRemixIntoNest } from './remix';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AuthService } from './modules/auth';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const appService = app.get(AppService);
  const authService = app.get(AuthService);
  const configService = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();

  const build = injectRemixIntoNest(expressApp, {
    appService,
    authService,
  });

  const port = configService.get<number>('app.port');
  await app.listen(port);
  logger.log(`Server is running on port ${port}`)

  if (process.env.NODE_ENV === 'development') {
    await broadcastDevReady(build);
    logger.debug('Sent dev ready signal to Remix');
  }
}

bootstrap();
