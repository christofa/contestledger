import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

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

    // Validate required fields
    if (!title || !reward || !deadline || !txHash || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Insert contest into SQLite
    const insert = db.prepare(`
      INSERT INTO contests (
        title,
        description,
        entry_type,
        reward,
        deadline,
        tx_hash,
        creator_address,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = insert.run(
      title,
      description || "",
      entryType || "Image",
      parseFloat(reward),
      deadline,
      txHash,
      creatorAddress,
      "active"
    )

    // Get the newly created contest
    const contest = db.prepare(`
      SELECT * FROM contests WHERE rowid = ?
    `).get(result.lastInsertRowid)

    return NextResponse.json({ success: true, contest })

  } catch (err: any) {
    console.error("Create contest error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}