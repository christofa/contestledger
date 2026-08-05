import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyContestTransaction } from "@/lib/ckb-verify"

export async function POST(req: NextRequest) {
  try {
    const {
      title, description, entryType,
      reward, deadline, txHash, creatorAddress,
    } = await req.json()

    if (!title || !reward || !deadline || !txHash || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // ── Verify the transaction actually exists on CKB testnet ─────────────────
    try {
      await verifyContestTransaction(txHash, {
        title,
        creatorAddress,
        reward: parseFloat(reward),
      })
    } catch (verifyErr: any) {
      console.error("Contest TX verification failed:", verifyErr.message)
      return NextResponse.json(
        { error: `Transaction verification failed: ${verifyErr.message}` },
        { status: 400 }
      )
    }

    // ── TX verified — safe to write to Turso ──────────────────────────────────
    await db.execute({
      sql: `INSERT INTO contests
            (title, description, entry_type, reward, deadline, tx_hash, creator_address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title,
        description || "",
        entryType || "Image",
        parseFloat(reward),
        deadline,
        txHash,
        creatorAddress,
        "active",
      ],
    })

    const result = await db.execute({
      sql: "SELECT * FROM contests WHERE tx_hash = ?",
      args: [txHash],
    })

    return NextResponse.json({ success: true, contest: result.rows[0] })

  } catch (err: any) {
    console.error("Create contest error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}