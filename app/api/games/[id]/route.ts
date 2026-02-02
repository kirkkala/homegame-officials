import { requireTeamManager } from "@/lib/auth-api"
import { getGameById, updateGame, deleteGame } from "@/lib/db"
import { updateGameSchema, validate } from "@/lib/validation"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = validate(updateGameSchema, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const { teamId, ...updates } = result.data

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    const needsManageAccess =
      updates.isHomeGame !== undefined ||
      updates.divisionId !== undefined ||
      updates.homeTeam !== undefined ||
      updates.awayTeam !== undefined ||
      updates.date !== undefined ||
      updates.time !== undefined ||
      updates.location !== undefined
    if (needsManageAccess) {
      const auth = await requireTeamManager(request, game.teamId)
      if ("response" in auth) return auth.response
    }

    if (updates.officials !== undefined) {
      if (!teamId) {
        return NextResponse.json({ error: "teamId is required" }, { status: 400 })
      }
      if (teamId !== game.teamId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const updatedGame = await updateGame(id, updates)
    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error("Failed to update game:", error)
    return NextResponse.json({ error: "Ottelun päivitys epäonnistui" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: "404 Game not found" }, { status: 404 })
    }

    const auth = await requireTeamManager(request, game.teamId)
    if ("response" in auth) return auth.response

    await deleteGame(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete game:", error)
    return NextResponse.json({ error: "Ottelun poisto epäonnistui" }, { status: 500 })
  }
}
