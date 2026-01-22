import { NextRequest, NextResponse } from "next/server"
import { getGames, createGames, deleteGamesByTeam, deleteAllGames } from "@/lib/db"
import { requireAuthUser, requireTeamManager } from "@/lib/auth-api"
import { createGamesSchema, validate } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")
    const games = await getGames(teamId || undefined)
    return NextResponse.json(games)
  } catch (error) {
    console.error("Failed to get games:", error)
    return NextResponse.json({ error: "Otteluiden haku epäonnistui" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = validate(createGamesSchema, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { games: newGames, teamId } = result.data

    const auth = await requireTeamManager(request, teamId)
    if ("response" in auth) return auth.response

    const gamesWithIds = newGames.map((game) => ({
      id: crypto.randomUUID(),
      teamId,
      divisionId: game.divisionId,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      isHomeGame: game.isHomeGame,
      date: game.date,
      time: game.time,
      location: game.location,
      officials: { poytakirja: null, kello: null },
    }))

    const savedGames = await createGames(gamesWithIds, teamId)
    return NextResponse.json(savedGames)
  } catch (error) {
    console.error("Failed to create games:", error)
    return NextResponse.json({ error: "Otteluiden tallennus epäonnistui" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")

    if (teamId) {
      const auth = await requireTeamManager(request, teamId)
      if ("response" in auth) return auth.response
      await deleteGamesByTeam(teamId)
    } else {
      const auth = await requireAuthUser(request)
      if ("response" in auth) return auth.response
      const { user } = auth
      if (!user.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      await deleteAllGames()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete games:", error)
    return NextResponse.json({ error: "Otteluiden poisto epäonnistui" }, { status: 500 })
  }
}
