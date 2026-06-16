import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const { contestId } = await params

    const entries = db.prepare(`
      SELECT
        id,
        contest_id,
        caption,
        project_url,
        creator_address,
        tx_hash,
        vote_count,
        created_at
      FROM entries
      WHERE contest_id = ?
      ORDER BY vote_count DESC, created_at ASC
    `).all(contestId)

    return NextResponse.json({ entries })

  } catch (err: any) {
    console.error("List entries error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}