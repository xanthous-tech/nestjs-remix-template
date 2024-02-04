import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  url: process.env.AUTH_URL || process.env.APP_URL,
  secure: process.env.NODE_ENV === 'production',
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
}));
