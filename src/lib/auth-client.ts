export type AuthUser = {
  id: string
  email: string
  isAdmin: boolean
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" })
  if (res.status === 401) return null
  if (!res.ok) {
    throw new Error("Pyyntö epäonnistui")
  }
  return res.json()
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" })
  if (!res.ok) {
    throw new Error("Uloskirjautuminen epäonnistui")
  }
}
