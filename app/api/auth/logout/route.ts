import { NextRequest, NextResponse } from "next/server"
import { getSessionCookieName } from "@/lib/auth"
import { clearSessionCookie } from "@/lib/auth-api"
import { deleteSessionByToken } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const cookieName = getSessionCookieName()
    const token = request.cookies.get(cookieName)?.value
    if (token) {
      await deleteSessionByToken(token)
    }

    const response = NextResponse.json({ success: true })
    clearSessionCookie(response)
    return response
  } catch (error) {
    console.error("Failed to logout:", error)
    return NextResponse.json({ error: "Uloskirjautuminen epäonnistui" }, { status: 500 })
  }
}
