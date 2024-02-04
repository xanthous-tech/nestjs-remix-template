import path from 'path';
import express from 'express';
import { createRequestHandler } from '@remix-run/express';
import type { Express } from 'express';
import type { AppLoadContext } from '@remix-run/server-runtime';

import type { AppService } from './app.service';
import { AuthService } from './modules/auth';

const BUILD_DIR = path.join(process.cwd(), 'build', 'index.js');
export const build = await import(BUILD_DIR);

declare module '@remix-run/server-runtime' {
  export interface AppLoadContext {
    appService: AppService;
    authService: AuthService;
  }
}

export function injectRemixIntoNest(
  expressApp: Express,
  apploadContext: AppLoadContext,
) {
  // Remix fingerprints its assets so we can cache forever.
  expressApp.use(
    '/build',
    express.static('public/build', { immutable: true, maxAge: '1y' }),
  );

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  expressApp.use(express.static('public', { maxAge: '1h' }));

  // Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase.
  expressApp.all('*', (req, res, next) => {
    // excluding this path to let bull-board handle it
    if (req.originalUrl.startsWith('/ctrls')) {
      next();
      return;
    }

    // exclude controller paths from the nestjs server
    if (req.originalUrl.startsWith('/api')) {
      next();
      return;
    }

    createRequestHandler({
      build,
      mode: build.mode,
      // getLoadContext can take in express req and res, use if needed
      getLoadContext: () => apploadContext,
    })(req, res, next);
  });

  return build;
}
