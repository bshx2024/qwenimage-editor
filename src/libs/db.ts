import {Pool} from 'pg'

let globalPool: Pool

export function getDb() {
  if (!globalPool) {
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      process.env.STORAGE_URL ||
      process.env.NEON_DATABASE_URL;

    globalPool = new Pool({
      connectionString,
      ssl: connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return globalPool;
}
