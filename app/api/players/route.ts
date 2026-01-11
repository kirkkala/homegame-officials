import { NextRequest, NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"

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
  const db = await readDB()
  const { name, teamId } = await request.json()

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
