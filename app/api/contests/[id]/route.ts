import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await db.execute({
      sql: "SELECT * FROM contests WHERE id = ?",
      args: [id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    return NextResponse.json({ contest: result.rows[0] })
  } catch (err: any) {
    console.error("Get contest error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}