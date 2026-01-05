import { NextResponse } from "next/server"
import { readDB, writeDB, type Game } from "@/lib/db"

export async function GET() {
  const db = await readDB()
  return NextResponse.json(db.games)
}

export async function POST(request: Request) {
  const db = await readDB()
  const newGames: Omit<Game, "id" | "createdAt" | "officials">[] = await request.json()

  const savedGames = newGames
    .filter(
      (game) =>
        !db.games.some(
          (g) => g.date === game.date && g.time === game.time && g.opponent === game.opponent
        )
    )
    .map((game) => ({
      ...game,
      id: crypto.randomUUID(),
      officials: { poytakirja: null, kello: null },
      createdAt: new Date().toISOString(),
    }))

  db.games.push(...savedGames)
  await writeDB(db)
  return NextResponse.json(savedGames)
}

export async function DELETE() {
  const db = await readDB()
  db.games = []
  await writeDB(db)
  return NextResponse.json({ success: true })
}
