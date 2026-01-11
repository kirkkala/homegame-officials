import { NextRequest, NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"
import { createPlayerSchema, validate } from "@/lib/validation"

export async function GET(request: NextRequest) {
  const db = await readDB()
  const teamId = request.nextUrl.searchParams.get("teamId")

  let players = db.players
  if (teamId) {
    players = players.filter((p) => p.teamId === teamId)
  }

  return NextResponse.json(players)
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = validate(createPlayerSchema, body)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const { name, teamId } = result.data
  const db = await readDB()

  const newPlayer = {
    id: crypto.randomUUID(),
    teamId,
    name,
    createdAt: new Date().toISOString(),
  }
  db.players.push(newPlayer)
  await writeDB(db)
  return NextResponse.json(newPlayer)
}
