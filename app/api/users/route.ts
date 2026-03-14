import { type NextRequest, NextResponse } from "next/server"
import { forbiddenResponse, requireAuthUser } from "@/lib/auth-api"
import { getUsers } from "@/lib/db"

export async function GET(request: NextRequest) {
  const auth = await requireAuthUser(request)
  if ("response" in auth) return auth.response
  if (!auth.user.isAdmin) return forbiddenResponse()

  const users = await getUsers()
  return NextResponse.json(users)
}
