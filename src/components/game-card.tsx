"use client"

import { Place as PlaceIcon } from "@mui/icons-material"
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material"
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
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            gridTemplateAreas: {
              xs: `"meta" "teams" "location"`,
              sm: `"meta location" "teams ."`,
            },
            columnGap: 2,
            rowGap: 0.5,
            alignItems: { xs: "start", sm: "center" },
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

          <Typography
            variant="body1"
            sx={{
              fontWeight: game.isHomeGame ? "bold" : "normal",
              gridArea: "teams",
              lineHeight: 1.3,
              mt: 1,
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
