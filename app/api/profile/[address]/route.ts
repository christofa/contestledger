import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      )
    }

    // Entries this address has submitted, with contest title
    const entries = db.prepare(`
      SELECT
        e.id,
        e.contest_id,
        e.caption,
        e.project_url,
        e.vote_count,
        e.tx_hash,
        e.created_at,
        c.title AS contest_title
      FROM entries e
      LEFT JOIN contests c ON e.contest_id = c.id
      WHERE e.creator_address = ?
      ORDER BY e.created_at DESC
    `).all(address)

    // Contests this address has created
    const contests = db.prepare(`
      SELECT *
      FROM contests
      WHERE creator_address = ?
      ORDER BY created_at DESC
    `).all(address)

    const totalVotes = (entries as any[]).reduce(
      (sum, e) => sum + (e.vote_count || 0),
      0
    )

    return NextResponse.json({
      address,
      entries,
      contests,
      stats: {
        contestsEntered: entries.length,
        votesReceived: totalVotes,
        rewardsEarned: 0,
        wins: 0,
      },
    })

  } catch (err: any) {
    console.error("Profile error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}