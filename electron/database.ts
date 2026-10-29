import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

let db: any = null;

function getDb() {
  if (!db) {
    const dbDir = app.isPackaged ? app.getPath('userData') : '.';
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'clipboard.db');
    db = new Database(dbPath);
  }
  return db;
}

export function initDb() {
  const database = getDb();
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      source_app TEXT
    );
  `);

  // Safe migration check for existing databases
  try {
    database.exec('ALTER TABLE clipboard_history ADD COLUMN source_app TEXT;');
  } catch (e) {
    // Column already exists
  }
}

export function addEntry(text: string, sourceApp = 'desktop') {
  const database = getDb();
  const stmt = database.prepare(
    'INSERT INTO clipboard_history (text, timestamp, source_app) VALUES (@text, @timestamp, @sourceApp)'
  );
  stmt.run({
    text: String(text),
    timestamp: Number(Date.now()),
    sourceApp: String(sourceApp)
  });
}

export function getHistory() {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM clipboard_history ORDER BY is_pinned DESC, timestamp DESC LIMIT 50');
  return stmt.all();
}

export function searchHistory(keyword: string) {
  if (!keyword) return getHistory();
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM clipboard_history WHERE text LIKE @keyword ORDER BY is_pinned DESC, timestamp DESC LIMIT 50');
  return stmt.all({ keyword: `%${String(keyword)}%` });
}

export function deleteEntry(id: number) {
  const database = getDb();
  database.prepare('DELETE FROM clipboard_history WHERE id = @id').run({ id: Number(id) });
}

export function clearUnpinnedHistory() {
  const database = getDb();
  database.prepare('DELETE FROM clipboard_history WHERE is_pinned = 0').run();
}

export function togglePin(id: number, isPinned: number) {
  const database = getDb();
  database.prepare('UPDATE clipboard_history SET is_pinned = @isPinned WHERE id = @id').run({ id: Number(id), isPinned: Number(isPinned) });
}

export function cleanupOldHistory(days = 7) {
  const database = getDb();
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  database.prepare('DELETE FROM clipboard_history WHERE is_pinned = 0 AND timestamp < @cutoff').run({ cutoff: Number(cutoffTime) });
}
