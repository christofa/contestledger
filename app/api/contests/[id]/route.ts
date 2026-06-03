import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params — required in Next.js 15
    const { id } = await params

    const contest = db.prepare(`
      SELECT
        id,
        title,
        description,
        entry_type,
        reward,
        deadline,
        tx_hash,
        creator_address,
        status,
        created_at
      FROM contests
      WHERE id = ?
    `).get(id)

    if (!contest) {
      return NextResponse.json(
        { error: "Contest not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ contest })

  } catch (err: any) {
    console.error("Get contest error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}