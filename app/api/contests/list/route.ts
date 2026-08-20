import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET() {
  try {
    const result = await db.execute(
      "SELECT * FROM contests ORDER BY created_at DESC"
    )
    return NextResponse.json({ contests: result.rows })
  } catch (err: any) {
    console.error("List contests error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
