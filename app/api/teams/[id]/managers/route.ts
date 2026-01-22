import { NextRequest, NextResponse } from "next/server"
import {
  getTeamById,
  getTeamManagers,
  getUserByEmail,
  addTeamManager,
  removeTeamManager,
} from "@/lib/db"
import { requireTeamManager } from "@/lib/auth-api"
import { teamManagerSchema, validate } from "@/lib/validation"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const team = await getTeamById(id)
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const auth = await requireTeamManager(request, id)
    if ("response" in auth) return auth.response

    const managers = await getTeamManagers(id)
    return NextResponse.json(managers)
  } catch (error) {
    console.error("Failed to get team managers:", error)
    return NextResponse.json({ error: "Käyttäjien haku epäonnistui" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const team = await getTeamById(id)
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const auth = await requireTeamManager(request, id)
    if ("response" in auth) return auth.response

    const body = await request.json()
    const result = validate(teamManagerSchema, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const targetUser = await getUserByEmail(result.data.email)
    if (!targetUser) {
      return NextResponse.json(
        { error: "Käyttäjää ei löydy. Pyydä häntä luomaan tunnus ensin." },
        { status: 404 }
      )
    }

    await addTeamManager(id, targetUser.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to add team manager:", error)
    return NextResponse.json({ error: "Käyttäjän lisääminen epäonnistui" }, { status: 500 })
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

    const body = await request.json()
    const result = validate(teamManagerSchema, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const targetUser = await getUserByEmail(result.data.email)
    if (!targetUser) {
      return NextResponse.json({ error: "Käyttäjää ei löydy" }, { status: 404 })
    }

    await removeTeamManager(id, targetUser.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove team manager:", error)
    return NextResponse.json({ error: "Käyttäjän poisto epäonnistui" }, { status: 500 })
  }
}
