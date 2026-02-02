import { requireTeamManager } from "@/lib/auth-api"
import { deletePlayer, getPlayerById } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const player = await getPlayerById(id)
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    const auth = await requireTeamManager(request, player.teamId)
    if ("response" in auth) return auth.response

    await deletePlayer(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete player:", error)
    return NextResponse.json({ error: "Pelaajan poisto epäonnistui" }, { status: 500 })
  }
}
