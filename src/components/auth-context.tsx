"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, logout as apiLogout, type AuthUser } from "@/lib/auth-client"

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      try {
        const me = await getCurrentUser()
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
