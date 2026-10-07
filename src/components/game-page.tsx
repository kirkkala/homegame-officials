"use client"

import { ArrowBack as ArrowBackIcon, Place as PlaceIcon } from "@mui/icons-material"
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"
import { ReboundTracker } from "@/components/rebound-tracker"
import { useGame } from "@/hooks/use-rebounds"
import { formatDate } from "@/lib/utils"

export function GamePage({ gameId }: { gameId: string }) {
  const { data: game, isLoading, error, sessionReady, runAction } = useGame(gameId)

  const homeHref = game ? `/?team=${encodeURIComponent(game.teamId)}` : "/"

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        {!sessionReady || isLoading ? (
          <Stack sx={{ alignItems: "center", py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : error || !game ? (
          <Paper sx={{ p: 3 }}>
            <IconButton
              component={Link}
              href={homeHref}
              aria-label="Takaisin ottelulistaan"
              data-testid="game-back"
              size="small"
              sx={{ ml: -1, mb: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" gutterBottom>
              Ottelua ei löytynyt
            </Typography>
            <Typography color="text.secondary">
              {error instanceof Error ? error.message : "Tarkista linkki tai palaa ottelulistaan."}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "flex-start" }}>
                <IconButton
                  component={Link}
                  href={homeHref}
                  aria-label="Takaisin ottelulistaan"
                  data-testid="game-back"
                  size="small"
                  sx={{ mt: -0.5, ml: -1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center", flexWrap: "wrap" }}
                  >
                    {game.divisionId && (
                      <Chip label={game.divisionId} size="small" sx={{ fontWeight: 600 }} />
                    )}
                    <Typography>
                      {formatDate(game.date, { format: "weekday" })} klo {game.time}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: 700, lineHeight: 1.3 }}
                    data-testid="game-title"
                  >
                    {game.homeTeam}
                    <Typography component="span" sx={{ color: "text.secondary", mx: 0.75 }}>
                      vs.
                    </Typography>
                    {game.awayTeam}
                  </Typography>
                  {game.location && (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <PlaceIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {game.location}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
              <ReboundTracker
                game={game}
                isCounter={!!game.rebounds?.isCounter}
                onAction={runAction}
              />
            </Paper>
          </Stack>
        )}
      </Container>
      <Footer />
    </Box>
  )
}
