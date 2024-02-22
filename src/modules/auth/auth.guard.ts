import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const cookies = request.headers['cookie'] || '';
    const sessionId = this.authService.readSessionFromCookieHeader(cookies);

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    const { session, user } = await this.authService.validateSession(sessionId);
    const sessionCookie = this.authService.getSessionCookieFromSession(session);
    if (sessionCookie) {
      response.setHeader('Set-Cookie', sessionCookie.serialize());
    }
    request['user'] = user;

    return true;
  }
}
