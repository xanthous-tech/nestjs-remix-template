import { useLoaderData } from '@remix-run/react';
import { json, type LoaderFunction, type MetaFunction } from '@remix-run/node';

import { Button } from '~/components/ui/button';
import { GitHubIcon } from '~/components/icons/github';

export const meta: MetaFunction = () => {
  return [
    { title: 'Sign into X-Accountant' },
    { name: 'description', content: 'Automated Accountant' },
  ];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const cookie = context.authService.createCallbackUrlCookie(callbackUrl);

  return json(
    {
      callbackUrl,
    },
    {
      headers: {
        'Set-Cookie': cookie.serialize(),
      },
    },
  );
};

export default function SignInPage() {
  const { callbackUrl } = useLoaderData<typeof loader>();

  return (
    <div className="m-4">
      <h2 className="text-xl font-bold my-2">Login</h2>
      <Button asChild>
        <a href="/api/auth/github">
          <GitHubIcon className="mr-2 h-4 w-4" />
          通过GitHub登录
        </a>
      </Button>
    </div>
  );
}
