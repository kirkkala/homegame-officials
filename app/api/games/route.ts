import { NextRequest, NextResponse } from "next/server"
import { readDB, writeDB, type Game } from "@/lib/db"

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
  const db = await readDB()
  const { games: newGames, teamId } = (await request.json()) as {
    games: Omit<Game, "id" | "createdAt" | "officials" | "teamId">[]
    teamId: string
  }

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
