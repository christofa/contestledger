import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const {
      contestId,
      caption,
      projectUrl,
      txHash,
      creatorAddress,
    } = await req.json()

    if (!contestId || !txHash || !creatorAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check contest exists
    const contest = db.prepare(
      "SELECT id FROM contests WHERE id = ?"
    ).get(contestId)

    if (!contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      )
    }

    const insert = db.prepare(`
      INSERT INTO entries (
        contest_id,
        caption,
        project_url,
        creator_address,
        tx_hash,
        vote_count
      ) VALUES (?, ?, ?, ?, ?, 0)
    `)

    insert.run(
      contestId,
      caption || "",
      projectUrl || "",
      creatorAddress,
      txHash
    )

    const entry = db.prepare(`
      SELECT * FROM entries WHERE tx_hash = ?
    `).get(txHash)

    return NextResponse.json({ success: true, entry })

  } catch (err: any) {
    console.error("Create entry error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}