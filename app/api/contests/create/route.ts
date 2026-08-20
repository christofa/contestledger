import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyContestTransaction } from "@/lib/ckb-verify"
import { ckbToShannons } from "@/lib/ckb-convert"

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      description,
      entryType,
      reward,
      deadline,
      txHash,
      creatorAddress,
    } = await req.json()

    if (!title || !reward || !deadline || !txHash || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const rewardCkb = parseFloat(reward)
    const rewardShannons = ckbToShannons(rewardCkb)

    // ── Verify the transaction exists on CKB testnet ──────────────────────────
    try {
      await verifyContestTransaction(txHash, {
        title,
        creatorAddress,
        reward: rewardCkb,
      })
    } catch (verifyErr: any) {
      console.error("Contest TX verification failed:", verifyErr.message)
      return NextResponse.json(
        { error: `Transaction verification failed: ${verifyErr.message}` },
        { status: 400 }
      )
    }

    // ── TX verified — store reward in shannons ────────────────────────────────
    await db.execute({
      sql: `INSERT INTO contests
            (title, description, entry_type, reward, deadline, tx_hash, creator_address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title,
        description || "",
        entryType || "Image",
        rewardShannons.toString(),
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
