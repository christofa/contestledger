import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { entryId, voterAddress } = await req.json()

    if (!entryId || !voterAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const entryCheck = await db.execute({
      sql: "SELECT * FROM entries WHERE id = ?",
      args: [entryId],
    })

    if (entryCheck.rows.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    const existingVote = await db.execute({
      sql: "SELECT id FROM votes WHERE entry_id = ? AND voter_address = ?",
      args: [entryId, voterAddress],
    })

    if (existingVote.rows.length > 0) {
      return NextResponse.json({ error: "You already voted for this entry" }, { status: 400 })
    }

    await db.execute({
      sql: "INSERT INTO votes (entry_id, voter_address) VALUES (?, ?)",
      args: [entryId, voterAddress],
    })

    await db.execute({
      sql: "UPDATE entries SET vote_count = vote_count + 1 WHERE id = ?",
      args: [entryId],
    })

    const updated = await db.execute({
      sql: "SELECT * FROM entries WHERE id = ?",
      args: [entryId],
    })

    return NextResponse.json({ success: true, entry: updated.rows[0] })
  } catch (err: any) {
    console.error("Vote error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}