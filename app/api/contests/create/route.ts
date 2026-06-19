import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

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

    await db.execute({
      sql: `INSERT INTO contests
            (title, description, entry_type, reward, deadline, tx_hash, creator_address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [title, description || "", entryType || "Image", parseFloat(reward), deadline, txHash, creatorAddress, "active"],
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