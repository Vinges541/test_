import { Pool } from 'pg';
import * as process from 'process';

class DatabaseService {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USERNAME,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      password: process.env.POSTGRES_PASSWORD,
      port: Number(process.env.POSTGRES_PORT),
    });
  }

  async init() {
    await this.pool.query(`
        CREATE SCHEMA IF NOT EXISTS insys;
        
        DO
        $$
            BEGIN
                CREATE TYPE insys.SEX_TRAIT AS ENUM ('male', 'female');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END
        $$;
        
        CREATE TABLE IF NOT EXISTS insys.person
        (
            id         SERIAL PRIMARY KEY,
            full_name  TEXT      NOT NULL,
            sex        insys.SEX_TRAIT NOT NULL,
            birth_date TIMESTAMPTZ      NOT NULL
        );`);
  }

  async close() {
    await this.pool.end();
  }

  async executeQuery(queryText: string, values?: any[]): Promise<any[]> {
    const result = await this.pool.query(queryText, values);
    return result.rows;
  }

  async executeTransaction(queryText: string, values?: any[]) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(queryText, values);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

const databaseService = new DatabaseService();

(async () => {
  await databaseService.init();
})();

export { databaseService };
