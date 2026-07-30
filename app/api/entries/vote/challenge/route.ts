import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const entryId = searchParams.get("entryId")

  if (!entryId) {
    return NextResponse.json({ error: "Missing entryId" }, { status: 400 })
  }

  const timestamp = Date.now()
  const message = `ContestLedger vote for entry ${entryId} at ${timestamp}`

  return NextResponse.json({ message })
}