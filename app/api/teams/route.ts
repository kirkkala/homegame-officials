import { NextResponse } from "next/server"
import { getTeams, createTeam, getTeamById } from "@/lib/db"
import { slugify } from "@/lib/utils"
import { createTeamSchema, validate } from "@/lib/validation"

export async function GET() {
  try {
    const teams = await getTeams()
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Failed to get teams:", error)
    return NextResponse.json({ error: "Joukkueiden haku epäonnistui" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = validate(createTeamSchema, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { name } = result.data

    // Generate ID from team name
    const id = slugify(name)

    // Check if team with this ID already exists
    const existingTeam = await getTeamById(id)
    if (existingTeam) {
      return NextResponse.json({ error: "Joukkue tällä nimellä on jo olemassa" }, { status: 409 })
    }

    const newTeam = await createTeam(id, name)
    return NextResponse.json(newTeam)
  } catch (error) {
    console.error("Failed to create team:", error)
    return NextResponse.json({ error: "Joukkueen luonti epäonnistui" }, { status: 500 })
  }
}
