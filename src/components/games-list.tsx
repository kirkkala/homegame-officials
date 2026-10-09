"use client"

import {
  CalendarMonth as CalendarMonthIcon,
  Leaderboard as LeaderboardIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { liveTeamListQueryOptions } from "@/lib/live-poll-query-options"
import { getGames, getPlayers } from "@/lib/storage"
import { computePlayerStats } from "@/lib/utils"
import { FirstAidBagsSummary } from "./first-aid-bags-summary"
import { GameCard } from "./game-card"
import { StatisticsDialog } from "./statistics-dialog"
import { useTeam } from "./team-context"

const PREFS_KEY = "gamesListPreferences"

function readShowPastGames(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return false
    return JSON.parse(raw).showPastGames === true
  } catch {
    return false
  }
}

function TeamToolbar({
  name,
  firstAidBagsEnabled,
  onOpenStats,
  extra,
}: {
  name: string
  firstAidBagsEnabled?: boolean
  onOpenStats: () => void
  extra?: ReactNode
}) {
  return (
    <Stack spacing={1} sx={{ bgcolor: "background.paper", borderRadius: 1, px: 2, py: 1.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Typography
            variant="h2"
            sx={{ fontWeight: "bold", fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
          >
            {name}
          </Typography>
          <Tooltip title="Toimitsijavuorotilasto">
            <IconButton
              size="small"
              onClick={onOpenStats}
              color="primary"
              aria-label="Näytä tilasto"
            >
              <LeaderboardIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {firstAidBagsEnabled && (
          <Box sx={{ alignSelf: { xs: "stretch", sm: "center" } }}>
            <FirstAidBagsSummary />
          </Box>
        )}
      </Stack>
      {extra}
    </Stack>
  )
}

export function GamesList() {
  const { selectedTeam, isLoading: teamLoading } = useTeam()
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const prevDataRef = useRef<string | null>(null)
  const [showPastGames, setShowPastGames] = useState(readShowPastGames)

  const {
    data: games = [],
    isLoading: gamesLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["games", selectedTeam?.id],
    queryFn: () => getGames(selectedTeam!.id),
    enabled: !!selectedTeam,
    ...liveTeamListQueryOptions,
    select: (data) =>
      data.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
  })

  const { data: rosterPlayers } = useQuery({
    queryKey: ["players", selectedTeam?.id],
    queryFn: () => getPlayers(selectedTeam!.id),
    enabled: !!selectedTeam,
    ...liveTeamListQueryOptions,
  })

  const rosterPlayerNames = rosterPlayers?.map((p) => p.name)

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ showPastGames }))
    } catch {
      // Ignore storage errors
    }
  }, [showPastGames])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPast = (date: string) => new Date(date) < today
  const visibleGames = showPastGames ? games : games.filter((game) => !isPast(game.date))
  const hasPastGames = games.some((game) => isPast(game.date))
  const playerStats = computePlayerStats(games)

  useEffect(() => {
    if (gamesLoading || !games.length) return

    const dataHash = JSON.stringify(games)
    const timer = setTimeout(() => {
      const prevHash = prevDataRef.current
      prevDataRef.current = dataHash
      if (prevHash !== null && prevHash !== dataHash) {
        setSnackbar("Tiedot päivitetty")
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [dataUpdatedAt, games, gamesLoading])

  if (!selectedTeam) return null

  if (teamLoading || gamesLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  const pastGamesToggle = hasPastGames ? (
    <FormControlLabel
      control={
        <Switch checked={showPastGames} onChange={(_, checked) => setShowPastGames(checked)} />
      }
      label="Näytä pelatut pelit"
    />
  ) : undefined

  return (
    <>
      <Stack sx={{ gap: { xs: 2, sm: 3 } }}>
        <TeamToolbar
          name={selectedTeam.name}
          firstAidBagsEnabled={selectedTeam.firstAidBagsEnabled}
          onOpenStats={() => setStatsDialogOpen(true)}
          extra={pastGamesToggle}
        />
        {games.length === 0 ? (
          <Stack sx={{ alignItems: "center", py: 6 }}>
            <CalendarMonthIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Ei otteluita joukkueella {selectedTeam.name}
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
        ) : visibleGames.length === 0 ? (
          <Stack
            sx={{
              alignItems: "center",
              py: 6,
              bgcolor: "background.paper",
              borderRadius: 1,
              px: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ei tulevia otteluita
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valitse &quot;Näytä pelatut pelit&quot; nähdäksesi menneet pelit.
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ gap: { xs: 1.5, sm: 2 } }}>
            {visibleGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isPast={isPast(game.date)}
                playerStats={playerStats}
                showShotClock={!!selectedTeam.shotClockEnabled}
              />
            ))}
          </Stack>
        )}
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

      <StatisticsDialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        games={games}
        rosterPlayerNames={rosterPlayerNames}
      />
    </>
  )
}
