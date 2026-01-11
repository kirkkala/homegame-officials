import { NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await readDB()

  const teamIndex = db.teams.findIndex((t) => t.id === id)
  if (teamIndex === -1) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  // Also delete all games and players belonging to this team
  db.teams.splice(teamIndex, 1)
  db.games = db.games.filter((g) => g.teamId !== id)
  db.players = db.players.filter((p) => p.teamId !== id)

  await writeDB(db)
  return NextResponse.json({ success: true })
}
