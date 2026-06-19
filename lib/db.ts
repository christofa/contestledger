import { createClient } from "@libsql/client"

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

// Create tables if they don't exist
async function initDb() {
  await db.execute(`
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

  await db.execute(`
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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      entry_id TEXT NOT NULL,
      voter_address TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(entry_id, voter_address),
      FOREIGN KEY (entry_id) REFERENCES entries(id)
    )
  `)
}

initDb().catch(console.error)

export default db