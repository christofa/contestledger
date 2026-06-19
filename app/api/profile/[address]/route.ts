import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params

    const entriesResult = await db.execute({
      sql: `SELECT e.*, c.title AS contest_title
            FROM entries e
            LEFT JOIN contests c ON e.contest_id = c.id
            WHERE e.creator_address = ?
            ORDER BY e.created_at DESC`,
      args: [address],
    })

    const contestsResult = await db.execute({
      sql: "SELECT * FROM contests WHERE creator_address = ? ORDER BY created_at DESC",
      args: [address],
    })

    const totalVotes = entriesResult.rows.reduce(
      (sum: number, e: any) => sum + (Number(e.vote_count) || 0),
      0
    )

    return NextResponse.json({
      address,
      entries: entriesResult.rows,
      contests: contestsResult.rows,
      stats: {
        contestsEntered: entriesResult.rows.length,
        votesReceived: totalVotes,
        rewardsEarned: 0,
        wins: 0,
      },
    })
  } catch (err: any) {
    console.error("Profile error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}