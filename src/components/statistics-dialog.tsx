"use client"

import { type Game } from "@/lib/storage"
import { computePlayerStatsArray } from "@/lib/utils"
import {
  Close as CloseIcon,
  EmojiEvents as EmojiEventsIcon,
  Leaderboard as LeaderboardIcon,
} from "@mui/icons-material"
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material"

const MEDAL_COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
} as const

function getMedalColor(stats: { count: number }[], index: number): string | undefined {
  if (stats.length === 0) return undefined

  const currentCount = stats[index]?.count
  if (currentCount === undefined) return undefined

  // Calculate the rank (1-based position accounting for ties)
  // Players with the same count share the same rank
  let rank = 1
  for (let i = 0; i < index; i++) {
    if (stats[i].count > currentCount) {
      rank = i + 2 // +2 because: +1 for 1-based, +1 for being after this player
    }
  }
  // Recalculate: rank is 1 + count of players with higher scores
  rank = stats.filter((s) => s.count > currentCount).length + 1

  // Check if tied with next player (no medal if tied at the boundary)
  const nextCount = stats[index + 1]?.count
  if (nextCount === currentCount) {
    // Still give medal if sharing a medal position (rank 1, 2, or 3)
    if (rank > 3) return undefined
  }

  switch (rank) {
    case 1:
      return MEDAL_COLORS.gold
    case 2:
      return MEDAL_COLORS.silver
    case 3:
      return MEDAL_COLORS.bronze
    default:
      return undefined
  }
}

type StatisticsDialogProps = {
  open: boolean
  onClose: () => void
  games: Game[]
}

export function StatisticsDialog({ open, onClose, games }: StatisticsDialogProps) {
  const stats = computePlayerStatsArray(games)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1}>
            <LeaderboardIcon color="primary" />
            <Typography variant="h6" component="span">
              Toimitsijavuorotilasto
            </Typography>
          </Stack>
          <IconButton aria-label="Sulje" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          Tilastossa näkyy kuinka monta toimitsijavuoroa (pöytäkirja tai kello) kullakin pelaajalla
          on vahvistettuna.
        </Typography>
        {stats.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography color="text.secondary">
              Ei vielä vahvistettuja toimitsijavuoroja.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {stats.map((stat, index) => {
              const medalColor = getMedalColor(stats, index)
              return (
                <ListItem
                  key={stat.name}
                  sx={{
                    py: 1,
                    borderBottom: index < stats.length - 1 ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 40 }}>
                    {medalColor ? (
                      <EmojiEventsIcon sx={{ color: medalColor, fontSize: "1.5rem" }} />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ width: 24, textAlign: "center" }}
                      >
                        {index + 1}.
                      </Typography>
                    )}
                  </Stack>
                  <ListItemText
                    primary={stat.name}
                    slotProps={{
                      primary: { fontWeight: medalColor ? 600 : 400 },
                    }}
                  />
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={medalColor ? "primary.main" : "text.secondary"}
                  >
                    {stat.count}
                  </Typography>
                </ListItem>
              )
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
