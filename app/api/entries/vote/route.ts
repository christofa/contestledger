import { NextRequest, NextResponse } from "next/server"
import { ccc } from "@ckb-ccc/connector-react"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { entryId, voterAddress, message, signature } = await req.json()

    // ── Validate all fields present ───────────────────────────────────────
    if (!entryId || !voterAddress || !message || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // ── Verify the challenge is fresh (within 5 minutes) ──────────────────
    const timestampMatch = message.match(/at (\d+)$/)
    if (!timestampMatch) {
      return NextResponse.json(
        { error: "Invalid challenge format" },
        { status: 400 }
      )
    }
    const challengeAge = Date.now() - parseInt(timestampMatch[1])
    if (challengeAge > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Challenge expired. Please try again." },
        { status: 400 }
      )
    }

    // ── Verify the challenge references this entry ────────────────────────
    if (!message.includes(`vote for entry ${entryId}`)) {
      return NextResponse.json(
        { error: "Challenge does not match this entry" },
        { status: 400 }
      )
    }

    // ── Verify the signature cryptographically ────────────────────────────
    try {
      const verified = await ccc.verifyMessageCkbSecp256k1(
        message,
        signature,
        voterAddress
      )
      if (!verified) {
        return NextResponse.json(
          { error: "Signature verification failed" },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // ── Check entry exists ────────────────────────────────────────────────
    const entryCheck = await db.execute({
      sql: "SELECT * FROM entries WHERE id = ?",
      args: [entryId],
    })
    if (entryCheck.rows.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // ── Check for duplicate vote ──────────────────────────────────────────
    const existingVote = await db.execute({
      sql: "SELECT id FROM votes WHERE entry_id = ? AND voter_address = ?",
      args: [entryId, voterAddress],
    })
    if (existingVote.rows.length > 0) {
      return NextResponse.json(
        { error: "You already voted for this entry" },
        { status: 400 }
      )
    }

    // ── Record the vote ───────────────────────────────────────────────────
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