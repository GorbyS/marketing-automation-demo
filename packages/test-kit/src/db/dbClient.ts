import { Pool, QueryResultRow } from 'pg';
import { getDatabaseUrl } from '../config/config';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return pool;
}

export async function queryOne<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const r = await getPool().query<T>(sql, params);
  return r.rows[0] ?? null;
}

export async function exec(sql: string, params: unknown[] = []): Promise<void> {
  await getPool().query(sql, params);
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
