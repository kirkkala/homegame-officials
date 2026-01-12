import { NextResponse } from "next/server"
import { deleteTeam, getTeamById } from "@/lib/db"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const team = await getTeamById(id)
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Games and players are deleted via cascade in the database
    await deleteTeam(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete team:", error)
    return NextResponse.json({ error: "Joukkueen poisto epäonnistui" }, { status: 500 })
  }
}
