import { requireTeamManager } from "@/lib/auth-api"
import { getPlayers, createPlayer } from "@/lib/db"
import { createPlayerSchema, validate } from "@/lib/validation"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")
    const players = await getPlayers(teamId || undefined)
    return NextResponse.json(players)
  } catch (error) {
    console.error("Failed to get players:", error)
    return NextResponse.json({ error: "Pelaajien haku epäonnistui" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = validate(createPlayerSchema, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { name, teamId } = result.data

    const auth = await requireTeamManager(request, teamId)
    if ("response" in auth) return auth.response

    const newPlayer = await createPlayer(crypto.randomUUID(), name, teamId)
    return NextResponse.json(newPlayer)
  } catch (error) {
    console.error("Failed to create player:", error)
    return NextResponse.json({ error: "Pelaajan tallennus epäonnistui" }, { status: 500 })
  }
}
