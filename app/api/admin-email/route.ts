import { NextRequest, NextResponse } from "next/server"
import { requireAuthUser } from "@/lib/auth-api"

export async function GET(request: NextRequest) {
  const auth = await requireAuthUser(request)
  if ("response" in auth) return auth.response

  return NextResponse.json({ email: process.env.ADMIN_EMAIL ?? null })
}
