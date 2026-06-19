import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contestId: string }> }
) {
  try {
    const { contestId } = await params

    const result = await db.execute({
      sql: `SELECT * FROM entries WHERE contest_id = ?
            ORDER BY vote_count DESC, created_at ASC`,
      args: [contestId],
    })

    return NextResponse.json({ entries: result.rows })
  } catch (err: any) {
    console.error("List entries error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}