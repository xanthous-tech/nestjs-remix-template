import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const databaseUrl =
    process.env.DATABASE_URL_FOR_MIGRATION ??
    process.env.DATABASE_URL ??
    'postgresql://invalid:invalid@invalid.pg.config:5432/invalid';
  console.log('Migrating database:', databaseUrl);
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: 'migrations' });
  await sql.end();
}

main();
