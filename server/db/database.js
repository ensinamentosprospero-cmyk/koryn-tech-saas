import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.STORE_DB_PATH || path.join(DATA_DIR, 'store.db');

let database = null;

export function getDatabase() {
  if (database) return database;

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  database = new DatabaseSync(DB_PATH);
  database.exec(readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

  return database;
}

export function getDatabasePath() {
  return DB_PATH;
}

export function closeDatabase() {
  if (database) {
    database.close();
    database = null;
  }
}
