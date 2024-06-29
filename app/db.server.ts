import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

import { DB } from './db';

const { Pool } = pg

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
