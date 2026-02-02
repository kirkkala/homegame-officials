import { requireAuthUser } from "@/lib/auth-api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const auth = await requireAuthUser(request)
  if ("response" in auth) return auth.response

  return NextResponse.json({ email: process.env.ADMIN_EMAIL ?? null })
}
