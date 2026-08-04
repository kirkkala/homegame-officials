import { type NextRequest, NextResponse } from "next/server"
import { requireTeamManager } from "@/lib/auth-api"
import { deleteTeam, getTeamById, updateTeamSettings } from "@/lib/db"
import { updateTeamSettingsSchema, validate } from "@/lib/validation"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const team = await getTeamById(id)
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const auth = await requireTeamManager(request, id)
    if ("response" in auth) return auth.response

    const body = await request.json()
    const result = validate(updateTeamSettingsSchema, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const updated = await updateTeamSettings(id, result.data)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update team:", error)
    return NextResponse.json({ error: "Joukkueen päivitys epäonnistui" }, { status: 500 })
  }
}

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
