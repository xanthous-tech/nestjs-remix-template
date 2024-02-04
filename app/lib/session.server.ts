import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Cookie } from 'oslo/cookie';
import type { User, Session } from 'lucia';

export interface ValidateSessionPayload {
  session: Session | null;
  user: User | null;
  sessionCookie: Cookie | null;
}

export async function validateSession({
  request,
  context,
}: LoaderFunctionArgs): Promise<ValidateSessionPayload> {
  const { pathname } = new URL(request.url);
  const { authService } = context;

  const cookieHeader = request.headers.get('cookie') || '';
  const sessionId = authService.readSessionFromCookieHeader(cookieHeader);

  if (!sessionId) {
    throw redirect(`/signin?callbackUrl=${pathname}`);
  }

  const { session, user } = await authService.validateSession(sessionId);
  const sessionCookie = authService.getSessionCookieFromSession(session);

  return {
    session,
    user,
    sessionCookie,
  };
}

export async function signout({
  request,
  context,
}: LoaderFunctionArgs): Promise<void> {
  const { authService } = context;
  const cookieHeader = request.headers.get('cookie') || '';
  const sessionId = authService.readSessionFromCookieHeader(cookieHeader);

  await authService.invalidateSession(sessionId);
}
