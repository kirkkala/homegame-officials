import { NextRequest, NextResponse } from "next/server"
import { requireAuthUser } from "@/lib/auth-api"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthUser(request)
    if ("response" in auth) return auth.response
    const { user } = auth
    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to get current user:", error)
    return NextResponse.json({ error: "Käyttäjän haku epäonnistui" }, { status: 500 })
  }
}
