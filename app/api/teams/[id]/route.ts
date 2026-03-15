import { type NextRequest, NextResponse } from "next/server"
import { requireTeamManager } from "@/lib/auth-api"
import { deleteTeam, getTeamById, updateTeamFirstAidSettings } from "@/lib/db"

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
    const firstAidBagsEnabled = body.firstAidBagsEnabled
    const firstAidBagCount = body.firstAidBagCount

    if (typeof firstAidBagsEnabled !== "boolean") {
      return NextResponse.json({ error: "firstAidBagsEnabled must be a boolean" }, { status: 400 })
    }
    const count = Number(firstAidBagCount)
    if (!Number.isInteger(count) || count < 1 || count > 6) {
      return NextResponse.json(
        { error: "firstAidBagCount must be an integer between 1 and 6" },
        { status: 400 }
      )
    }

    const updated = await updateTeamFirstAidSettings(id, {
      firstAidBagsEnabled,
      firstAidBagCount: count,
    })
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
