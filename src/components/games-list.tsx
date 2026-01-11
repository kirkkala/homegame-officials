"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button, CircularProgress, Stack, Typography } from "@mui/material"
import { CalendarMonth, Groups, UploadFile } from "@mui/icons-material"
import { TeamSelector } from "./team-selector"
import { GameCard } from "./game-card"
import { useTeam } from "./team-context"
import { getGames, type Game } from "@/lib/storage"

export function GamesList() {
  const { selectedTeam, isLoading: teamLoading } = useTeam()
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (teamLoading) return

    const loadGames = async () => {
      if (!selectedTeam) {
        setGames([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const storedGames = await getGames(selectedTeam.id)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      setGames(
        storedGames
          .filter((game) => new Date(game.date) >= now)
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      )
      setIsLoading(false)
    }

    loadGames()
  }, [selectedTeam, teamLoading])

  if (isLoading || teamLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    )
  }

  if (!selectedTeam) {
    return (
      <Stack alignItems="center" py={8}>
        <Groups sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Valitse joukkue
        </Typography>
        <TeamSelector />
      </Stack>
    )
  }

  if (games.length === 0) {
    return (
      <Stack alignItems="center" py={8}>
        <CalendarMonth sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Ei pelejä
        </Typography>
        <Button component={Link} href="/hallinta" variant="contained" startIcon={<UploadFile />}>
          Siirry hallintaan
        </Button>
      </Stack>
    )
  }

  return (
    <Stack gap={{ xs: 2, sm: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          {selectedTeam.name} seuraavat pelit
        </Typography>
      </Stack>
      <Stack gap={{ xs: 1.5, sm: 2 }}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </Stack>
    </Stack>
  )
}
