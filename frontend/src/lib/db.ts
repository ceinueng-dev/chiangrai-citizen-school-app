import { Pool } from 'pg';

// Global pool for serverless environments
let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export function toPostgresQuery(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  const pgSql = toPostgresQuery(sql);
  const result = await p.query(pgSql, params);
  return result.rows as T[];
}

export async function getOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function execute(sql: string, params: any[] = []): Promise<{ lastID?: number; rowCount?: number }> {
  const p = getPool();
  let pgSql = toPostgresQuery(sql);
  const isInsert = /^\s*insert\s+/i.test(pgSql) && !/\sreturning\s+/i.test(pgSql);
  if (isInsert) {
    pgSql += ' RETURNING id';
  }
  const result = await p.query(pgSql, params);
  const lastID = result.rows[0]?.id;
  return { lastID, rowCount: result.rowCount ?? 0 };
}
