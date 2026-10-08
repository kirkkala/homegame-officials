"use client"

import { EditOutlined as EditOutlinedIcon } from "@mui/icons-material"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { shortTeamName } from "@/lib/rebounds"
import type { Game, GameResult } from "@/lib/storage"

const SCORE_MAX = 199

function parseScore(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > SCORE_MAX) return null
  return parsed
}

export function GameResultForm({
  game,
  onSave,
  live = false,
}: {
  game: Game
  onSave: (result: GameResult) => Promise<unknown>
  live?: boolean
}) {
  const scores = game.result ?? { home: 0, away: 0 }
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<{ home: string; away: string } | null>(null)

  async function save(next: GameResult) {
    setBusy(true)
    setError(null)
    try {
      await onSave(next)
      setDraft(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tuloksen tallennus epäonnistui")
    } finally {
      setBusy(false)
    }
  }

  async function saveDraft() {
    if (!draft) return
    const home = parseScore(draft.home)
    const away = parseScore(draft.away)
    if (home === null || away === null) {
      setError("Syötä pisteluku (0–199)")
      return
    }
    await save({ home, away })
  }

  return (
    <Stack spacing={0.75}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          columnGap: 1,
          rowGap: 0.5,
          alignItems: "center",
        }}
      >
        <TeamLabel>{shortTeamName(game.homeTeam)}</TeamLabel>
        <span />
        <TeamLabel>{shortTeamName(game.awayTeam)}</TeamLabel>
        <Score testId="home" value={scores.home} />
        <IconButton
          data-testid="game-result-edit"
          aria-label="Syötä tulos"
          onClick={() => {
            setDraft({ home: String(scores.home), away: String(scores.away) })
            setError(null)
          }}
          disabled={busy}
          size="small"
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <Score testId="away" value={scores.away} />
        {live && (
          <>
            <PointButtons
              testId="home"
              disabled={busy}
              onAdd={(points) =>
                void save({ ...scores, home: Math.min(SCORE_MAX, scores.home + points) })
              }
            />
            <span />
            <PointButtons
              testId="away"
              disabled={busy}
              onAdd={(points) =>
                void save({ ...scores, away: Math.min(SCORE_MAX, scores.away + points) })
              }
            />
          </>
        )}
      </Box>
      {error && !draft && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}
      <Dialog
        open={draft !== null}
        onClose={() => {
          setDraft(null)
          setError(null)
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Syötä tulos</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", mt: 0.5 }}>
            <TextField
              autoFocus
              type="number"
              label={game.homeTeam}
              value={draft?.home ?? ""}
              disabled={busy}
              error={Boolean(error)}
              onChange={(event) =>
                setDraft((prev) => (prev ? { ...prev, home: event.target.value } : prev))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveDraft()
              }}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: SCORE_MAX,
                  inputMode: "numeric",
                  "data-testid": "game-result-dialog-home",
                  style: { textAlign: "center" },
                },
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Typography sx={{ fontWeight: 700, color: "text.secondary", pt: 2.75 }}>–</Typography>
            <TextField
              type="number"
              label={game.awayTeam}
              value={draft?.away ?? ""}
              disabled={busy}
              error={Boolean(error)}
              helperText={error}
              onChange={(event) =>
                setDraft((prev) => (prev ? { ...prev, away: event.target.value } : prev))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveDraft()
              }}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: SCORE_MAX,
                  inputMode: "numeric",
                  "data-testid": "game-result-dialog-away",
                  style: { textAlign: "center" },
                },
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDraft(null)
              setError(null)
            }}
          >
            Peru
          </Button>
          <Button
            data-testid="game-result-dialog-save"
            variant="contained"
            disabled={busy}
            onClick={() => void saveDraft()}
          >
            Tallenna
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

function TeamLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      noWrap
      sx={{ fontWeight: 700, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis" }}
    >
      {children}
    </Typography>
  )
}

function Score({ testId, value }: { testId: string; value: number }) {
  return (
    <Box
      data-testid={`game-result-${testId}-score`}
      sx={{
        textAlign: "center",
        fontSize: "2rem",
        fontWeight: 800,
        lineHeight: 1.1,
        py: 0.25,
      }}
    >
      {value}
    </Box>
  )
}

function PointButtons({
  testId,
  disabled,
  onAdd,
}: {
  testId: string
  disabled: boolean
  onAdd: (points: number) => void
}) {
  return (
    <Stack direction="row" spacing={0.75}>
      {[1, 2, 3].map((points) => (
        <Button
          key={points}
          data-testid={`game-result-${testId}-add-${points}`}
          variant="outlined"
          disabled={disabled}
          onClick={() => onAdd(points)}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 44,
            px: 0.5,
            fontSize: "1.05rem",
            fontWeight: 700,
          }}
        >
          +{points}
        </Button>
      ))}
    </Stack>
  )
}
