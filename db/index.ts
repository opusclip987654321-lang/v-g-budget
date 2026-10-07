import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Base SQLite locale (fichier dans DATA_DIR). L'interface reprend le sous-ensemble
// de l'API D1 utilisé par le code : prepare().bind().first/all/run et batch().
export type RunResult<T = Record<string, unknown>> = { results: T[]; meta: { changes: number } };

export class Statement {
  constructor(private database: DatabaseSync, private sql: string, private values: SQLInputValue[] = []) {}
  bind(...values: unknown[]) {
    return new Statement(this.database, this.sql, values.map(v => (v === undefined ? null : typeof v === 'boolean' ? Number(v) : v) as SQLInputValue));
  }
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    return (this.database.prepare(this.sql).get(...this.values) as T | undefined) ?? null;
  }
  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    return { results: this.database.prepare(this.sql).all(...this.values) as T[] };
  }
  async run(): Promise<RunResult> {
    return this.execute();
  }
  execute<T = Record<string, unknown>>(): RunResult<T> {
    const statement = this.database.prepare(this.sql);
    if (statement.columns().length) return { results: statement.all(...this.values) as T[], meta: { changes: 0 } };
    const result = statement.run(...this.values);
    return { results: [], meta: { changes: Number(result.changes) } };
  }
}

export class Database {
  constructor(private database: DatabaseSync) {}
  prepare(sql: string) {
    return new Statement(this.database, sql);
  }
  async batch<T = Record<string, unknown>>(statements: Statement[]) {
    this.database.exec('BEGIN');
    try {
      const results = statements.map(s => s.execute<T>());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

export function dataDir() {
  return process.env.DATA_DIR || join(process.cwd(), 'data');
}

function migrate(database: DatabaseSync) {
  database.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const folder = join(process.cwd(), 'drizzle');
  const applied = new Set((database.prepare('SELECT name FROM _migrations').all() as { name: string }[]).map(r => r.name));
  for (const name of readdirSync(folder).filter(f => f.endsWith('.sql')).sort()) {
    if (applied.has(name)) continue;
    const statements = readFileSync(join(folder, name), 'utf8').split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);
    database.exec('BEGIN');
    try {
      for (const sql of statements) database.exec(sql);
      database.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString());
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
}

const globalForDb = globalThis as unknown as { vegeDb?: Database };

export function getRawDb(): Database {
  if (globalForDb.vegeDb) return globalForDb.vegeDb;
  mkdirSync(dataDir(), { recursive: true });
  const database = new DatabaseSync(join(dataDir(), 'vegebudget.sqlite'));
  database.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  migrate(database);
  globalForDb.vegeDb = new Database(database);
  return globalForDb.vegeDb;
}
