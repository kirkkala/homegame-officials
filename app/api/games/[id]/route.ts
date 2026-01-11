import { NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"
import { updateGameSchema, validate } from "@/lib/validation"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const result = validate(updateGameSchema, body)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const updates = result.data
  const db = await readDB()

  const game = db.games.find((g) => g.id === id)
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 })

  // Update officials if provided (only allowed keys: poytakirja, kello)
  if (updates.officials) {
    if (updates.officials.poytakirja !== undefined) {
      game.officials.poytakirja = updates.officials.poytakirja
    }
    if (updates.officials.kello !== undefined) {
      game.officials.kello = updates.officials.kello
    }
  }

  // Update isHomeGame if provided
  if (updates.isHomeGame !== undefined) {
    game.isHomeGame = updates.isHomeGame
  }

  await writeDB(db)
  return NextResponse.json(game)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await readDB()

  const index = db.games.findIndex((g) => g.id === id)
  if (index === -1) return NextResponse.json({ error: "Game not found" }, { status: 404 })

  db.games.splice(index, 1)
  await writeDB(db)
  return NextResponse.json({ success: true })
}
