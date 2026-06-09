import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET() {
  try {
    // Fetch all active contests from SQLite
    // ordered by most recently created first
    const contests = db
      .prepare(
        `
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
      ORDER BY created_at DESC
    `
      )
      .all()

    return NextResponse.json({ contests })
  } catch (err: any) {
    console.error("List contests error:", err.message)
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    )
  }
}
