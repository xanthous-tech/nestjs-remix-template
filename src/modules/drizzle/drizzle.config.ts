import { registerAs } from '@nestjs/config';

export default registerAs('drizzle', () => ({
  databaseUrl: process.env.DATABASE_URL,
  maxConnections: Number(process.env.DB_MAX_CONNECTIONS) || 10,
}));
