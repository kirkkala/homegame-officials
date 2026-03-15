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
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { getGames } from "@/lib/storage"
import { computePlayerStats } from "@/lib/utils"
import { FirstAidBagsSummary } from "./first-aid-bags-summary"
import { GameCard } from "./game-card"
import { StatisticsDialog } from "./statistics-dialog"
import { useTeam } from "./team-context"

export function GamesList() {
  const { selectedTeam, isLoading: teamLoading } = useTeam()
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const prevDataRef = useRef<string | null>(null)
  const preferencesKey = "gamesListPreferences"
  const readPreferences = () => {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem(preferencesKey)
      if (!raw) return null
      return JSON.parse(raw) as { showPastGames?: boolean; showAwayGames?: boolean }
    } catch {
      return null
    }
  }
  const [showPastGames, setShowPastGames] = useState(() => {
    const prefs = readPreferences()
    return typeof prefs?.showPastGames === "boolean" ? prefs.showPastGames : false
  })
  const [showAwayGames, setShowAwayGames] = useState(() => {
    const prefs = readPreferences()
    return typeof prefs?.showAwayGames === "boolean" ? prefs.showAwayGames : false
  })

  const {
    data: allGames = [],
    isLoading: gamesLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["games", selectedTeam?.id],
    queryFn: () => getGames(selectedTeam!.id),
    enabled: !!selectedTeam,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    select: (data) =>
      data.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
  })

  useEffect(() => {
    try {
      localStorage.setItem(preferencesKey, JSON.stringify({ showPastGames, showAwayGames }))
    } catch {
      // Ignore storage errors
    }
  }, [showPastGames, showAwayGames])

  // Filter games based on checkboxes
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const games = allGames.filter((game) => {
    if (!showPastGames && new Date(game.date) < now) return false
    if (!showAwayGames && !game.isHomeGame) return false
    return true
  })
  const pastGamesCount = allGames.filter((game) => new Date(game.date) < now).length

  // Detect when data changes and show snackbar (via async callback to satisfy lint rules)
  useEffect(() => {
    if (gamesLoading || !allGames.length) return

    const dataHash = JSON.stringify(allGames)
    const timer = setTimeout(() => {
      // Access ref inside async callback, not during render
      const prevHash = prevDataRef.current
      prevDataRef.current = dataHash
      if (prevHash !== null && prevHash !== dataHash) {
        setSnackbar("Tiedot päivitetty")
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [dataUpdatedAt, allGames, gamesLoading])

  // Helper to check if a game is in the past
  const isGamePast = (gameDate: string) => new Date(gameDate) < now

  // Compute confirmed shift counts per player (for dropdown display)
  const playerStats = computePlayerStats(allGames)

  if (!selectedTeam) return null

  if (teamLoading || gamesLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    )
  }

  const filterCheckboxes = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={{ xs: 0, sm: 2 }}
      useFlexGap
      sx={{ "& .MuiFormControlLabel-root": { marginBottom: 0 } }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={!showAwayGames}
            onChange={(e) => setShowAwayGames(!e.target.checked)}
            size="small"
          />
        }
        label="Näytä vain kotipelit"
        slotProps={{ typography: { variant: "body2", color: "text.secondary" } }}
      />
      {pastGamesCount > 0 && (
        <FormControlLabel
          control={
            <Checkbox
              checked={showPastGames}
              onChange={(e) => setShowPastGames(e.target.checked)}
              size="small"
            />
          }
          label="Näytä pelatut pelit"
          slotProps={{ typography: { variant: "body2", color: "text.secondary" } }}
        />
      )}
    </Stack>
  )

  if (allGames.length === 0) {
    return (
      <>
        <Stack gap={{ xs: 2, sm: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={2}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              px: 2,
              py: 1.5,
            }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                {selectedTeam.name}
              </Typography>
              <Tooltip title="Toimitsijavuorotilasto">
                <IconButton
                  size="small"
                  onClick={() => setStatsDialogOpen(true)}
                  color="primary"
                  aria-label="Näytä tilasto"
                >
                  <LeaderboardIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box sx={{ alignSelf: { xs: "stretch", sm: "center" } }}>
              <FirstAidBagsSummary />
            </Box>
          </Stack>
          <Stack alignItems="center" py={6}>
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
        </Stack>
        <StatisticsDialog
          open={statsDialogOpen}
          onClose={() => setStatsDialogOpen(false)}
          games={[]}
        />
      </>
    )
  }

  return (
    <>
      <Stack gap={{ xs: 2, sm: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            px: 2,
            py: 1.5,
          }}
        >
          <Stack gap={1} minWidth={0} sx={{ order: { xs: 0, sm: 0 } }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                {selectedTeam.name}
              </Typography>
              <Tooltip title="Toimitsijavuorotilasto">
                <IconButton
                  size="small"
                  onClick={() => setStatsDialogOpen(true)}
                  color="primary"
                  aria-label="Näytä tilasto"
                >
                  <LeaderboardIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>{filterCheckboxes}</Box>
          </Stack>
          <Box sx={{ order: { xs: 1, sm: 2 }, alignSelf: { xs: "stretch", sm: "center" } }}>
            <FirstAidBagsSummary />
          </Box>
          <Box
            sx={{
              display: { xs: "block", sm: "none" },
              order: { xs: 2, sm: 0 },
              my: { xs: -0.5, sm: 0 },
            }}
          >
            <Divider sx={{ my: 1 }} />
            {filterCheckboxes}
          </Box>
        </Stack>
        {games.length === 0 ? (
          <Stack
            alignItems="center"
            py={6}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 1,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Ei otteluita valituilla suodattimilla
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Poista &quot;Näytä vain kotipelit&quot; tai valitse &quot;Näytä pelatut pelit&quot;
              nähdäksesi kaikki ottelut.
            </Typography>
          </Stack>
        ) : (
          <Stack gap={{ xs: 1.5, sm: 2 }}>
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isPast={isGamePast(game.date)}
                playerStats={playerStats}
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
        games={allGames}
      />
    </>
  )
}
