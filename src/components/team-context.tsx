"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  getTeams,
  getManagedTeams,
  createTeam as apiCreateTeam,
  deleteTeam as apiDeleteTeam,
  getSelectedTeamId,
  setSelectedTeamId,
  type Team,
} from "@/lib/storage"

type TeamContextType = {
  teams: Team[]
  selectedTeam: Team | null
  isLoading: boolean
  selectTeam: (teamId: string | null) => void
  createTeam: (name: string) => Promise<Team>
  deleteTeam: (id: string) => Promise<void>
  refreshTeams: () => Promise<Team[]>
}

const TeamContext = createContext<TeamContextType | null>(null)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()
  const user = session?.user
  const authLoading = status === "loading"

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isHallinta = pathname.startsWith("/hallinta")

  const refreshTeams = useCallback(async () => {
    try {
      if (isHallinta) {
        if (!user) {
          setTeams([])
          return []
        }
        const loadedTeams = await getManagedTeams()
        setTeams(loadedTeams)
        return loadedTeams
      }
      const loadedTeams = await getTeams()
      setTeams(loadedTeams)
      return loadedTeams
    } catch {
      setTeams([])
      return []
    }
  }, [isHallinta, user])

  const updateUrl = useCallback(
    (teamId: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (teamId) {
        params.set("team", teamId)
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      } else {
        params.delete("team")
        router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, {
          scroll: false,
        })
      }
    },
    [searchParams, router, pathname]
  )

  useEffect(() => {
    const init = async () => {
      if (authLoading) return
      if (isHallinta && !user) {
        setTeams([])
        setSelectedTeamIdState(null)
        setSelectedTeamId(null)
        setIsLoading(false)
        return
      }
      const loadedTeams = await refreshTeams()
      const urlTeamId = searchParams.get("team")
      const storedTeamId = getSelectedTeamId()

      // Priority: URL > localStorage (validate team exists)
      const findTeam = (id: string | null) => loadedTeams.find((t) => t.id === id)?.id
      const teamId = findTeam(urlTeamId) ?? findTeam(storedTeamId) ?? null

      if (teamId) {
        setSelectedTeamIdState(teamId)
        setSelectedTeamId(teamId)
        if (urlTeamId !== teamId) updateUrl(teamId)
      } else {
        setSelectedTeamIdState(null)
        setSelectedTeamId(null)
      }

      setIsLoading(false)
    }
    init()
  }, [authLoading, isHallinta, refreshTeams, searchParams, updateUrl, user])

  const selectTeam = useCallback(
    (teamId: string | null) => {
      setSelectedTeamIdState(teamId)
      setSelectedTeamId(teamId)
      updateUrl(teamId)
    },
    [updateUrl]
  )

  const createTeam = useCallback(
    async (name: string) => {
      const newTeam = await apiCreateTeam(name)
      setTeams((prev) => [...prev, newTeam])
      // Auto-select the new team
      selectTeam(newTeam.id)
      return newTeam
    },
    [selectTeam]
  )

  const deleteTeamHandler = useCallback(
    async (id: string) => {
      await apiDeleteTeam(id)
      setTeams((prev) => {
        const remaining = prev.filter((t) => t.id !== id)
        // If deleted team was selected, select another one
        if (selectedTeamId === id) {
          const newSelection = remaining.length > 0 ? remaining[0].id : null
          selectTeam(newSelection)
        }
        return remaining
      })
    },
    [selectedTeamId, selectTeam]
  )

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeam,
        isLoading,
        selectTeam,
        createTeam,
        deleteTeam: deleteTeamHandler,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
