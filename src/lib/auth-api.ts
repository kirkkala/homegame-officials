import { NextRequest, NextResponse } from "next/server"
import {
  canManageTeam,
  getAuthUserFromRequest,
  getSessionCookieName,
  type AuthUser,
} from "@/lib/auth"

type AuthGuardResult = { user: AuthUser } | { response: NextResponse }

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function requireAuthUser(request: NextRequest): Promise<AuthGuardResult> {
  const user = await getAuthUserFromRequest(request)
  if (!user) {
    return { response: unauthorizedResponse() }
  }
  return { user }
}

export async function requireTeamManager(
  request: NextRequest,
  teamId: string
): Promise<AuthGuardResult> {
  const auth = await requireAuthUser(request)
  if ("response" in auth) return auth

  const allowed = await canManageTeam(auth.user, teamId)
  if (!allowed) {
    return { response: forbiddenResponse() }
  }
  return auth
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(getSessionCookieName(), "", { maxAge: 0, path: "/" })
}
