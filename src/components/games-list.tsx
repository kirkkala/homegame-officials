"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Alert, Button, CircularProgress, Snackbar, Stack, Typography } from "@mui/material"
import {
  CalendarMonth as CalendarMonthIcon,
  Groups as GroupsIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import { TeamSelector } from "./team-selector"
import { GameCard } from "./game-card"
import { useTeam } from "./team-context"
import { getGames } from "@/lib/storage"

export function GamesList() {
  const { selectedTeam, isLoading: teamLoading } = useTeam()
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const prevDataRef = useRef<string | null>(null)

  const {
    data: games = [],
    isLoading: gamesLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["games", selectedTeam?.id],
    queryFn: () => getGames(selectedTeam!.id),
    enabled: !!selectedTeam,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    select: (data) => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      return data
        .filter((game) => new Date(game.date) >= now)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    },
  })

  // Detect when data changes and show snackbar (via async callback to satisfy lint rules)
  useEffect(() => {
    if (gamesLoading || !games.length) return

    const dataHash = JSON.stringify(games)
    const timer = setTimeout(() => {
      // Access ref inside async callback, not during render
      const prevHash = prevDataRef.current
      prevDataRef.current = dataHash
      if (prevHash !== null && prevHash !== dataHash) {
        setSnackbar("Tiedot päivitetty")
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [dataUpdatedAt, games, gamesLoading])

  if (teamLoading || gamesLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    )
  }

  if (!selectedTeam) {
    return (
      <Stack alignItems="center" py={8}>
        <GroupsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Valitse joukkue
        </Typography>
        <TeamSelector showCreateButton />
      </Stack>
    )
  }

  if (games.length === 0) {
    return (
      <Stack alignItems="center" py={8}>
        <CalendarMonthIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Ei otteluita
        </Typography>
        <Button
          component={Link}
          href="/hallinta"
          variant="contained"
          startIcon={<UploadFileIcon />}
        >
          Siirry hallintaan
        </Button>
      </Stack>
    )
  }

  return (
    <>
      <Stack gap={{ xs: 2, sm: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            {selectedTeam.name} seuraavat ottelut
          </Typography>
        </Stack>
        <Stack gap={{ xs: 1.5, sm: 2 }}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </Stack>
      </Stack>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="info" onClose={() => setSnackbar(null)} variant="filled">
          {snackbar}
        </Alert>
      </Snackbar>
    </>
  )
}
