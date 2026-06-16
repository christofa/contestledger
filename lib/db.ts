import Database from "better-sqlite3"
import path from "path"

// Use the same auth.db file better-auth already created
const db = new Database(path.join(process.cwd(), "auth.db"))

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL")

// Create contests table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS contests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    entry_type TEXT NOT NULL DEFAULT 'Image',
    reward REAL NOT NULL,
    deadline TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    creator_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    contest_id TEXT NOT NULL,
    caption TEXT,
    project_url TEXT,
    creator_address TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    vote_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (contest_id) REFERENCES contests(id)
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    entry_id TEXT NOT NULL,
    voter_address TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(entry_id, voter_address),
    FOREIGN KEY (entry_id) REFERENCES entries(id)
  )
`)

export default db 