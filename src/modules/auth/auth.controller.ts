import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { parseCookies } from 'oslo/cookie';
import { OAuth2RequestError } from 'arctic';

import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('github')
  async githubAuth(@Res({ passthrough: true }) res: Response) {
    const { state, url } = await this.authService.getGitHubAuthorizationUrl();

    res
      .appendHeader(
        'Set-Cookie',
        this.authService.createGitHubStateCookie(state).serialize(),
      )
      .redirect(url.toString());
  }

  @Get('github/callback')
  async githubAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = parseCookies(req.headers.cookie ?? '');
    const storedState = cookies.get('github_oauth_state') ?? null;
    if (!code || !state || !storedState || state !== storedState) {
      return new BadRequestException('Invalid state');
    }

    try {
      const tokens = await this.authService.getGitHubAccessToken(code);
      const githubUser = await this.authService.getGitHubUser(tokens);

      const cookie =
        await this.authService.getSessionCookieFromGitHubUser(githubUser);

      const callbackUrl = cookies.get('auth_callback_url') ?? '/';

      return res
        .appendHeader('Set-Cookie', cookie.serialize())
        .redirect(callbackUrl);
    } catch (e) {
      if (
        e instanceof OAuth2RequestError &&
        e.message === 'bad_verification_code'
      ) {
        // invalid code
        res.status(400).end('Invalid code');
        return;
      }
      res.status(500).end('Internal server error');
      return;
    }
  }
}
