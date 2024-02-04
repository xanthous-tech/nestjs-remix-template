import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub, GitHubTokens, generateState } from 'arctic';
import { generateId, Lucia, TimeSpan, type Session } from 'lucia';
import { Cookie } from 'oslo/cookie';
import { eq } from 'drizzle-orm';

import { DrizzleService, sessionTable, userTable } from '@/modules/drizzle';

interface DatabaseUserAttributes {
  githubId: number;
  githubUsername: string;
}

interface GitHubUser {
  id: string;
  login: string;
}

function initializeLucia(adapter: DrizzlePostgreSQLAdapter) {
  return new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(30, 'd'),
    sessionCookie: {
      attributes: {
        // set to `true` when using HTTPS
        secure: process.env.NODE_ENV === 'production',
      },
    },
    getUserAttributes: (attributes) => {
      return {
        githubId: attributes.githubId,
        githubUsername: attributes.githubUsername,
      };
    },
  });
}

declare module 'lucia' {
  interface Register {
    Lucia: ReturnType<typeof initializeLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

@Injectable()
export class AuthService implements OnModuleInit {
  private logger = new Logger(AuthService.name);

  private url: string;
  private secure: boolean;
  private adapter: DrizzlePostgreSQLAdapter;
  private lucia: ReturnType<typeof initializeLucia>;
  private github: GitHub;

  constructor(
    private readonly configService: ConfigService,
    private readonly drizzleService: DrizzleService,
  ) {
    this.url = this.configService.get<string>('auth.url');
    this.secure = this.configService.get<boolean>('auth.secure');

    this.adapter = new DrizzlePostgreSQLAdapter(
      this.drizzleService.dbInstance,
      sessionTable,
      userTable,
    );

    this.lucia = initializeLucia(this.adapter);

    const { clientId, clientSecret } = this.configService.get('auth.github');

    this.github = new GitHub(clientId, clientSecret, {
      redirectURI: `${this.url}/api/auth/github/callback`,
    });
  }

  async onModuleInit() {
    // run this on startup to delete expired sessions
    await this.lucia.deleteExpiredSessions();
    this.logger.debug('Deleted expired sessions');
  }

  public get luciaInstance() {
    return this.lucia;
  }

  public get isSecure(): boolean {
    return this.secure;
  }

  public readSessionFromCookieHeader(cookieHeader: string) {
    return this.lucia.readSessionCookie(cookieHeader);
  }

  public async validateSession(sessionId: string) {
    return this.lucia.validateSession(sessionId);
  }

  public async invalidateSession(sessionId: string) {
    return this.lucia.invalidateSession(sessionId);
  }

  public async invalidateUserSessions(userId: string) {
    return this.lucia.invalidateUserSessions(userId);
  }

  public getSessionCookieFromSession(session: Session | null): Cookie | null {
    if (!session) {
      return this.lucia.createBlankSessionCookie();
    }

    if (session?.fresh) {
      return this.lucia.createSessionCookie(session.id);
    }

    return null;
  }

  public createCallbackUrlCookie(callbackUrl: string) {
    return new Cookie('auth_callback_url', callbackUrl, {
      path: '/',
      secure: this.secure,
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'strict',
    });
  }

  public async getGitHubAuthorizationUrl() {
    const state = generateState();
    const url = await this.github.createAuthorizationURL(state);
    return {
      url,
      state,
    };
  }

  public createGitHubStateCookie(state: string) {
    return new Cookie('github_oauth_state', state, {
      path: '/',
      secure: this.secure,
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'lax',
    });
  }

  public async getGitHubAccessToken(code: string) {
    return this.github.validateAuthorizationCode(code);
  }

  public async getGitHubUser(tokens: GitHubTokens) {
    const githubUserResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUser: GitHubUser = await githubUserResponse.json();
    return githubUser;
  }

  public async getSessionCookieFromGitHubUser(githubUser: GitHubUser) {
    const db = this.drizzleService.dbInstance;

    let users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.githubId, githubUser.id))
      .limit(1);

    if (users.length === 0) {
      const userId = generateId(15);
      users = await db
        .insert(userTable)
        .values({
          id: userId,
          githubId: githubUser.id,
          githubUsername: githubUser.login,
        })
        .returning();
    }

    const user = users[0];
    const session = await this.lucia.createSession(user.id, {});
    return this.lucia.createSessionCookie(session.id);
  }
}
