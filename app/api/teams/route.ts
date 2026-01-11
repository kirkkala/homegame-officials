import { NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"
import { slugify } from "@/lib/utils"

export async function GET() {
  const db = await readDB()
  return NextResponse.json(db.teams)
}

export async function POST(request: Request) {
  const db = await readDB()
  const { name } = await request.json()

  // Generate ID from team name
  const id = slugify(name)

  // Check if team with this ID (or same name) already exists
  const existingTeam = db.teams.find((team) => team.id === id)
  if (existingTeam) {
    return NextResponse.json({ error: "Joukkue tällä nimellä on jo olemassa" }, { status: 409 })
  }

  const newTeam = {
    id,
    name,
    createdAt: new Date().toISOString(),
  }

  db.teams.push(newTeam)
  await writeDB(db)
  return NextResponse.json(newTeam)
}
