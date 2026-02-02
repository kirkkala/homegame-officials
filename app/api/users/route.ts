import { NextRequest, NextResponse } from "next/server"
import { getUsers } from "@/lib/db"
import { forbiddenResponse, requireAuthUser } from "@/lib/auth-api"

export async function GET(request: NextRequest) {
  const auth = await requireAuthUser(request)
  if ("response" in auth) return auth.response
  if (!auth.user.isAdmin) return forbiddenResponse()

  const users = await getUsers()
  return NextResponse.json(users)
}
