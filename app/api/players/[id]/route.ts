import { NextResponse } from "next/server"
import { deletePlayer, getPlayerById } from "@/lib/db"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const player = await getPlayerById(id)
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    await deletePlayer(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete player:", error)
    return NextResponse.json({ error: "Pelaajan poisto epäonnistui" }, { status: 500 })
  }
}
