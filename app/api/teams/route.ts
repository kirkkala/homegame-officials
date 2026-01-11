import { NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"

export async function GET() {
  const db = await readDB()
  return NextResponse.json(db.teams)
}

export async function POST(request: Request) {
  const db = await readDB()
  const { name } = await request.json()

  // Find the highest existing ID and add 1
  const maxId = db.teams.reduce((max, team) => {
    const numId = parseInt(team.id, 10)
    return isNaN(numId) ? max : Math.max(max, numId)
  }, 0)

  const newTeam = {
    id: String(maxId + 1),
    name,
    createdAt: new Date().toISOString(),
  }

  db.teams.push(newTeam)
  await writeDB(db)
  return NextResponse.json(newTeam)
}
