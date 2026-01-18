import { NextRequest } from "next/server"
import { randomBytes } from "crypto"
import {
  createSession as createSessionRecord,
  deleteSessionByToken,
  getSessionByToken,
  getUserById,
  isUserTeamManager,
} from "@/lib/db"

const SESSION_COOKIE_NAME = "homegame_session"
const SESSION_TTL_DAYS = 30
const ADMIN_EMAIL = "timo.kirkkala@gmail.com"

export type AuthUser = {
  id: string
  email: string
  isAdmin: boolean
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  await createSessionRecord({
    id: crypto.randomUUID(),
    userId,
    token,
    expiresAt,
  })
  return { token, expiresAt }
}

export async function getAuthUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const session = await getSessionByToken(token)
  if (!session) return null

  if (session.expiresAt.getTime() < Date.now()) {
    await deleteSessionByToken(token)
    return null
  }

  const user = await getUserById(session.userId)
  if (!user) return null

  return { id: user.id, email: user.email, isAdmin: user.email === ADMIN_EMAIL }
}

export async function canManageTeam(user: AuthUser, teamId: string) {
  if (user.isAdmin) return true
  return isUserTeamManager(user.id, teamId)
}
