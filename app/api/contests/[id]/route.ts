import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = rawId?.trim()

    if (!id) {
      return NextResponse.json({ error: "Missing contest id" }, { status: 400 })
    }

    const contest = db
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
      WHERE id = ? OR tx_hash = ?
    `
      )
      .get(id, id)

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
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
