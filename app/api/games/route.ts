import { NextRequest, NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"
import { createGamesSchema, validate } from "@/lib/validation"

export async function GET(request: NextRequest) {
  const db = await readDB()
  const teamId = request.nextUrl.searchParams.get("teamId")

  let games = db.games
  if (teamId) {
    games = games.filter((g) => g.teamId === teamId)
  }

  return NextResponse.json(games)
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = validate(createGamesSchema, body)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const { games: newGames, teamId } = result.data
  const db = await readDB()

  const savedGames = newGames
    .filter(
      (game) =>
        !db.games.some(
          (g) =>
            g.teamId === teamId &&
            g.date === game.date &&
            g.time === game.time &&
            g.homeTeam === game.homeTeam &&
            g.awayTeam === game.awayTeam
        )
    )
    .map((game) => ({
      ...game,
      teamId,
      id: crypto.randomUUID(),
      officials: { poytakirja: null, kello: null },
      createdAt: new Date().toISOString(),
    }))

  db.games.push(...savedGames)
  await writeDB(db)
  return NextResponse.json(savedGames)
}

export async function DELETE(request: NextRequest) {
  const db = await readDB()
  const teamId = request.nextUrl.searchParams.get("teamId")

  if (teamId) {
    db.games = db.games.filter((g) => g.teamId !== teamId)
  } else {
    db.games = []
  }

  await writeDB(db)
  return NextResponse.json({ success: true })
}
