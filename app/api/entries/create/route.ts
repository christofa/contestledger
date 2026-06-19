import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { contestId, caption, projectUrl, txHash, creatorAddress } =
      await req.json()

    if (!contestId || !txHash || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const contestResult = await db.execute({
      sql: "SELECT id FROM contests WHERE id = ?",
      args: [contestId],
    })

    if (contestResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      )
    }

    await db.execute({
      sql: `
        INSERT INTO entries (
          contest_id,
          caption,
          project_url,
          creator_address,
          tx_hash,
          vote_count
        ) VALUES (?, ?, ?, ?, ?, 0)
      `,
      args: [contestId, caption || "", projectUrl || "", creatorAddress, txHash],
    })

    const entryResult = await db.execute({
      sql: "SELECT * FROM entries WHERE tx_hash = ?",
      args: [txHash],
    })

    return NextResponse.json({ success: true, entry: entryResult.rows[0] })

  } catch (err: any) {
    console.error("Create entry error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}
