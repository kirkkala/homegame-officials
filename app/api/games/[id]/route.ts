import { NextResponse } from "next/server"
import { getGameById, updateGame, deleteGame } from "@/lib/db"
import { updateGameSchema, validate } from "@/lib/validation"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = validate(updateGameSchema, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const updates = result.data

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const updatedGame = await updateGame(id, updates)
    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error("Failed to update game:", error)
    return NextResponse.json({ error: "Ottelun päivitys epäonnistui" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: "404 Game not found" }, { status: 404 })
    }

    await deleteGame(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete game:", error)
    return NextResponse.json({ error: "Ottelun poisto epäonnistui" }, { status: 500 })
  }
}
