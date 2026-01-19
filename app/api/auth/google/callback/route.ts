import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import { setSessionCookie } from "@/lib/auth-api"
import { createUser, getUserByEmail } from "@/lib/db"

const STATE_COOKIE_NAME = "google_oauth_state"

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth ei ole määritetty" }, { status: 500 })
  }

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json({ error: "Virheellinen OAuth-pyyntö" }, { status: 400 })
  }

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${request.nextUrl.origin}/api/auth/google/callback`

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: "Google-kirjautuminen epäonnistui" }, { status: 400 })
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string }
  const accessToken = tokenData.access_token
  if (!accessToken) {
    return NextResponse.json({ error: "Google-kirjautuminen epäonnistui" }, { status: 400 })
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!profileResponse.ok) {
    return NextResponse.json({ error: "Google-profiilin haku epäonnistui" }, { status: 400 })
  }

  const profile = (await profileResponse.json()) as { email?: string }
  if (!profile.email) {
    return NextResponse.json({ error: "Sähköpostia ei saatu Googlelta" }, { status: 400 })
  }

  const email = profile.email.toLowerCase()
  let user = await getUserByEmail(email)
  if (!user) {
    user = await createUser({
      id: randomUUID(),
      email,
    })
  }

  const { token, expiresAt } = await createSession(user.id)
  const response = NextResponse.redirect(new URL("/hallinta", request.nextUrl.origin))
  setSessionCookie(response, token, expiresAt)
  response.cookies.set(STATE_COOKIE_NAME, "", { maxAge: 0, path: "/" })
  return response
}
