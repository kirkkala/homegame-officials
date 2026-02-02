import { requireAuthUser } from "@/lib/auth-api"
import { getTeams, createTeam, getTeamById, addTeamManager } from "@/lib/db"
import { slugify } from "@/lib/utils"
import { createTeamSchema, validate } from "@/lib/validation"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const teams = await getTeams()
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Failed to get teams:", error)
    return NextResponse.json({ error: "Joukkueiden haku epäonnistui" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthUser(request)
    if ("response" in auth) return auth.response
    const { user } = auth

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
    await addTeamManager(id, user.id)
    return NextResponse.json(newTeam)
  } catch (error) {
    console.error("Failed to create team:", error)
    return NextResponse.json({ error: "Joukkueen luonti epäonnistui" }, { status: 500 })
  }
}
