"use client"

import {
  ChevronRight as ChevronRightIcon,
  Place as PlaceIcon,
  SportsBasketball as SportsBasketballIcon,
} from "@mui/icons-material"
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material"
import Link from "next/link"
import type { Game } from "@/lib/storage"
import { formatDate } from "@/lib/utils"
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
  const reboundCount = game.rebounds?.events.length ?? 0
  return (
    <Card variant="outlined">
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          component={Link}
          href={reboundHref}
          data-testid={`game-link-${game.id}`}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", sm: "1fr auto" },
            gridTemplateAreas: {
              xs: `"meta chevron" "teams chevron" "location chevron"`,
              sm: `"meta location" "teams chevron"`,
            },
            columnGap: 2,
            rowGap: 0.5,
            alignItems: { xs: "start", sm: "center" },
            mb: 1,
            textDecoration: "none",
            color: "inherit",
            borderRadius: 1,
            "&:hover .game-link-chevron": { color: "primary.main" },
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
              {formatDate(game.date, { format: "weekday" })} klo {game.time}
            </Typography>
          </Stack>

          {game.location && (
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 0.5,
                gridArea: "location",
                justifySelf: { xs: "flex-start", sm: "flex-end" },
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
                fontWeight: game.isHomeGame ? "bold" : "normal",
                lineHeight: 1.3,
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
          </Stack>
          <Stack
            className="game-link-chevron"
            direction="row"
            spacing={0.75}
            sx={{
              gridArea: "chevron",
              alignItems: "center",
              color: "text.secondary",
              justifySelf: "end",
            }}
          >
            {game.rebounds?.counterName && <Chip size="small" label={game.rebounds.counterName} />}
            {reboundCount > 0 && (
              <Chip
                size="small"
                icon={<SportsBasketballIcon />}
                label={reboundCount}
                sx={{ "& .MuiChip-icon": { fontSize: "0.95rem" } }}
              />
            )}
            <ChevronRightIcon />
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
