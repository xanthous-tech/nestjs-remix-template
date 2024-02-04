import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './drizzle.schema';

@Injectable()
export class DrizzleService {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('drizzle.databaseUrl');
    const maxConnections = this.configService.get<number>(
      'drizzle.maxConnections',
    );
    const queryClient = postgres(databaseUrl, { max: maxConnections });
    this.db = drizzle(queryClient, { schema });
  }

  public get dbInstance() {
    return this.db;
  }
}
