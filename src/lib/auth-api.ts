import { createUser, getUserByEmail, isUserTeamManager } from "@/lib/db"
import { randomUUID } from "crypto"
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase()

export type AuthUser = {
  id: string
  email: string
  isAdmin: boolean
}

type AuthGuardResult = { user: AuthUser } | { response: NextResponse }

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function requireAuthUser(request: NextRequest): Promise<AuthGuardResult> {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const email = token?.email?.toLowerCase()
  if (!email) {
    return { response: unauthorizedResponse() }
  }

  let user = await getUserByEmail(email)
  if (!user) {
    user = await createUser({ id: randomUUID(), email })
  }

  return {
    user: { id: user.id, email: user.email, isAdmin: !!ADMIN_EMAIL && user.email === ADMIN_EMAIL },
  }
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

async function canManageTeam(user: AuthUser, teamId: string) {
  if (user.isAdmin) return true
  return isUserTeamManager(user.id, teamId)
}
