import { json, type LoaderFunction, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { validateSession } from '~/lib/session.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'New NestJS-Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader: LoaderFunction = async (args) => {
  const payload = await validateSession(args);
  const headers = {};
  if (payload.sessionCookie) {
    headers['Set-Cookie'] = payload.sessionCookie.serialize();
  }

  const { context } = args;

  return json(
    {
      message: context.appService.getHello(),
      user: payload.user,
    },
    {
      headers,
    },
  );
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="m-4">
      <h2 className="text-xl font-bold my-2">NestJS Remix Template</h2>
      <p>{data.message}</p>
      <p>
        This is the UI for managing various tedious finance functions of X-Tech.
      </p>
      <p>
        You are logged in as{' '}
        {data.user?.githubUsername}.
      </p>
      <p>
        <a href="/signout" className="underline">
          Sign out here
        </a>
      </p>
    </div>
  );
}
