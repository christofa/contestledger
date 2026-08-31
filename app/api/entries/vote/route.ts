import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyVoteTransaction } from "@/lib/ckb-verify"

export async function POST(req: NextRequest) {
  try {
    const { entryId, voterAddress, txHash } = await req.json()

    // ── Validate fields ───────────────────────────────────────────────────
    if (!entryId || !voterAddress || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // ── Check entry exists and get its tx_hash ────────────────────────────
    const entryCheck = await db.execute({
      sql: "SELECT * FROM entries WHERE id = ?",
      args: [entryId],
    })
    if (entryCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      )
    }

    const entry = entryCheck.rows[0]
    const entryTxHash = entry.tx_hash as string

    // ── Verify the Vote Cell on CKB testnet ───────────────────────────────
    try {
      await verifyVoteTransaction(txHash, {
        entryId,
        entryTxHash,
        voterAddress,
      })
    } catch (verifyErr: any) {
      console.error("Vote TX verification failed:", verifyErr.message)
      return NextResponse.json(
        { error: `Vote verification failed: ${verifyErr.message}` },
        { status: 400 }
      )
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

    // ── Record the vote with its CKB tx_hash ──────────────────────────────
    await db.execute({
      sql: "INSERT INTO votes (entry_id, voter_address, tx_hash) VALUES (?, ?, ?)",
      args: [entryId, voterAddress, txHash],
    })
    await db.execute({
      sql: "UPDATE entries SET vote_count = vote_count + 1 WHERE id = ?",
      args: [entryId],
    })

    const updated = await db.execute({
      sql: "SELECT * FROM entries WHERE id = ?",
      args: [entryId],
    })

    return NextResponse.json({
      success: true,
      entry: updated.rows[0],
      txHash,
    })

  } catch (err: any) {
    console.error("Vote error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}