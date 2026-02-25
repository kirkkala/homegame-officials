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

  // No medals if everyone has the same count (no clear winner)
  const uniqueCounts = new Set(stats.map((s) => s.count))
  if (uniqueCounts.size === 1) return undefined

  // Rank is 1 + count of players with higher scores
  const rank = stats.filter((s) => s.count > currentCount).length + 1

  if (rank > 3) return undefined

  // Count how many players share this rank
  const playersAtThisRank = stats.filter((s) => s.count === currentCount).length

  // No medal if more than 2 players share the position
  if (playersAtThisRank > 2) return undefined

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
