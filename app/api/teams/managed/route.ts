import { requireAuthUser } from "@/lib/auth-api"
import { getTeams, getManagedTeams } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthUser(request)
    if ("response" in auth) return auth.response
    const { user } = auth

    const teams = user.isAdmin ? await getTeams() : await getManagedTeams(user.id)
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Failed to get managed teams:", error)
    return NextResponse.json({ error: "Joukkueiden haku epäonnistui" }, { status: 500 })
  }
}
