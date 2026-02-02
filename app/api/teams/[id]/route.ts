import { requireTeamManager } from "@/lib/auth-api"
import { deleteTeam, getTeamById } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const team = await getTeamById(id)
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const auth = await requireTeamManager(request, id)
    if ("response" in auth) return auth.response

    // Games and players are deleted via cascade in the database
    await deleteTeam(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete team:", error)
    return NextResponse.json({ error: "Joukkueen poisto epäonnistui" }, { status: 500 })
  }
}
