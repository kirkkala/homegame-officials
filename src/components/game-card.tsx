"use client"

import { Place as PlaceIcon, SportsBasketball as SportsBasketballIcon } from "@mui/icons-material"
import { Box, Card, CardContent, Chip, Link, Stack, Typography } from "@mui/material"
import NextLink from "next/link"
import { hasReboundCounts } from "@/lib/rebounds"
import type { Game } from "@/lib/storage"
import { formatDate, formatGameResult } from "@/lib/utils"
import { OfficialAssigner } from "./official-assigner"

export function GameCard({
  game,
  isPast = false,
  playerStats,
  showShotClock = false,
}: {
  game: Game
  isPast?: boolean
  playerStats?: Map<string, number>
  showShotClock?: boolean
}) {
  const gameName = `${game.homeTeam} vs. ${game.awayTeam}`
  const reboundHref = `/ottelu/${game.id}?team=${encodeURIComponent(game.teamId)}`
  const hasReboundStats = hasReboundCounts(game.rebounds)
  return (
    <Card variant="outlined">
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gridTemplateAreas: `"meta stats" "teams teams" "location location"`,
            columnGap: 1.5,
            rowGap: 0.5,
            alignItems: "start",
            mb: 1,
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 0.75,
              gridArea: "meta",
            }}
          >
            {game.divisionId && (
              <Chip label={game.divisionId} size="small" sx={{ fontWeight: 600 }} />
            )}
            {isPast && (
              <Chip label="Pelattu" size="small" sx={{ fontSize: "0.7rem", lineHeight: 1.4 }} />
            )}
            <Typography>
              {formatDate(game.date, { format: "weekdayShort" })} klo {game.time}
            </Typography>
          </Stack>

          <Link
            component={NextLink}
            href={reboundHref}
            data-testid={`game-link-${game.id}`}
            underline="hover"
            aria-label={hasReboundStats ? "Tilastot kirjattu" : "Tilastot"}
            sx={{
              gridArea: "stats",
              justifySelf: "end",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            {hasReboundStats && <SportsBasketballIcon sx={{ fontSize: "1.15rem" }} />}
            Tilastot
          </Link>

          {game.location && (
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 0.5,
                gridArea: "location",
              }}
            >
              <PlaceIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  textAlign: { xs: "left", sm: "right" },
                }}
              >
                {game.location}
              </Typography>
            </Stack>
          )}

          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1,
              gridArea: "teams",
              mt: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: game.isHomeGame ? 700 : 400,
                lineHeight: 1.3,
                minWidth: 0,
              }}
            >
              {game.homeTeam}
              <Typography
                component="span"
                sx={{
                  color: "text.secondary",
                  mx: 0.5,
                }}
              >
                vs.
              </Typography>
              {game.awayTeam}
            </Typography>
            {game.result && (
              <Typography
                data-testid={`game-score-${game.id}`}
                sx={{ fontWeight: 800, whiteSpace: "nowrap", ml: "auto", pl: 1 }}
              >
                {formatGameResult(game.result)}
              </Typography>
            )}
          </Stack>
        </Box>

        {game.isHomeGame && (
          <Stack
            direction={{ xs: "column", md: "row" }}
            sx={{
              gap: 1,
              mt: { xs: 0, md: 1.5 },
            }}
          >
            <OfficialAssigner
              gameId={game.id}
              role="poytakirja"
              assignment={game.officials.poytakirja}
              teamId={game.teamId}
              gameName={gameName}
              gameDivisionId={game.divisionId}
              gameDate={game.date}
              gameTime={game.time}
              playerStats={playerStats}
            />
            <OfficialAssigner
              gameId={game.id}
              role="kello"
              assignment={game.officials.kello}
              teamId={game.teamId}
              gameName={gameName}
              gameDivisionId={game.divisionId}
              gameDate={game.date}
              gameTime={game.time}
              playerStats={playerStats}
            />
            {showShotClock && (
              <OfficialAssigner
                gameId={game.id}
                role="hyokkaysaika"
                assignment={game.officials.hyokkaysaika ?? null}
                teamId={game.teamId}
                gameName={gameName}
                gameDivisionId={game.divisionId}
                gameDate={game.date}
                gameTime={game.time}
                playerStats={playerStats}
              />
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
