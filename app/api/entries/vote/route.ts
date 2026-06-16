import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { entryId, voterAddress } = await req.json()

    if (!entryId || !voterAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check entry exists
    const entry = db.prepare(
      "SELECT * FROM entries WHERE id = ?"
    ).get(entryId)

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      )
    }

    // Check this address hasn't already voted for this entry
    const existingVote = db.prepare(`
      SELECT id FROM votes WHERE entry_id = ? AND voter_address = ?
    `).get(entryId, voterAddress)

    if (existingVote) {
      return NextResponse.json(
        { error: "You already voted for this entry" },
        { status: 400 }
      )
    }

    // Record the vote
    db.prepare(`
      INSERT INTO votes (entry_id, voter_address)
      VALUES (?, ?)
    `).run(entryId, voterAddress)

    // Increment the entry's vote count
    db.prepare(`
      UPDATE entries SET vote_count = vote_count + 1 WHERE id = ?
    `).run(entryId)

    const updatedEntry = db.prepare(
      "SELECT * FROM entries WHERE id = ?"
    ).get(entryId)

    return NextResponse.json({ success: true, entry: updatedEntry })

  } catch (err: any) {
    console.error("Vote error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}