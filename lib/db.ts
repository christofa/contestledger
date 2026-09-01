import { createClient } from "@libsql/client"

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contests (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      description TEXT,
      entry_type TEXT NOT NULL DEFAULT 'Image',
      reward INTEGER NOT NULL,
      deadline TEXT NOT NULL,
      tx_hash TEXT UNIQUE NOT NULL,
      creator_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  await db.execute(`
    UPDATE contests
    SET reward = CAST(ROUND(reward * 100000000) AS INTEGER)
    WHERE reward < 1000000000
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      entry_id TEXT NOT NULL,
      voter_address TEXT NOT NULL,
      tx_hash TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(entry_id, voter_address),
      FOREIGN KEY (entry_id) REFERENCES entries(id)
    )
  `)

  try {
    await db.execute(`ALTER TABLE votes ADD COLUMN tx_hash TEXT`)
  } catch {
    // The column already exists, or the table was just created above.
  }
}

initDb().catch(console.error)

export default db
