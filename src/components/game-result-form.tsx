"use client"

import { EditOutlined as EditOutlinedIcon } from "@mui/icons-material"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { type ReactNode, useEffect, useState } from "react"
import { shortTeamName } from "@/lib/rebounds"
import type { Game, GameResult } from "@/lib/storage"

const SCORE_MAX = 199

function parseScore(value: string): number | null {
  if (value.trim() === "") return 0
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > SCORE_MAX) return null
  return parsed
}

function scoreDraftValue(value: number): string {
  return value === 0 ? "" : String(value)
}

export function GameResultForm({
  game,
  onSave,
  live = false,
  trackBaskets = false,
  onTrackBaskets,
  sessionControl,
}: {
  game: Game
  onSave: (result: GameResult) => Promise<unknown>
  live?: boolean
  trackBaskets?: boolean
  onTrackBaskets?: (enabled: boolean) => Promise<unknown>
  sessionControl?: ReactNode
}) {
  const scores = game.result ?? { home: 0, away: 0 }
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [basketsOn, setBasketsOn] = useState(trackBaskets)
  const [draft, setDraft] = useState<{ home: string; away: string } | null>(null)
  const scoreLocked = trackBaskets && !live
  const editLabel = scoreLocked
    ? `${game.rebounds?.counterName ?? "Joku"} kirjaa koreja`
    : "Syötä tulos"

  useEffect(() => {
    setBasketsOn(trackBaskets)
  }, [trackBaskets])

  useEffect(() => {
    if (!scoreLocked) return
    setDraft(null)
    setError(null)
  }, [scoreLocked])

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

  async function toggleBaskets(checked: boolean) {
    setBasketsOn(checked)
    try {
      await onTrackBaskets?.(checked)
    } catch {
      setBasketsOn(trackBaskets)
    }
  }

  return (
    <Stack spacing={0.75}>
      {(live || sessionControl) && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          {sessionControl}
          {live && (
            <FormControlLabel
              sx={{ ml: 0, mr: 0, whiteSpace: "nowrap" }}
              control={
                <Switch
                  checked={basketsOn}
                  onChange={(_, checked) => void toggleBaskets(checked)}
                />
              }
              label="Kirjaa korit"
            />
          )}
        </Stack>
      )}
      <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
        Tulos
      </Typography>
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
        <Score
          testId="home"
          value={scores.home}
          minus={
            live && basketsOn ? (
              <MinusOne
                testId="home"
                disabled={busy || scores.home === 0}
                onClick={() => void save({ ...scores, home: Math.max(0, scores.home - 1) })}
              />
            ) : undefined
          }
        />
        <IconButton
          data-testid="game-result-edit"
          aria-label={editLabel}
          onClick={() => {
            if (scoreLocked) return
            setDraft({ home: scoreDraftValue(scores.home), away: scoreDraftValue(scores.away) })
            setError(null)
          }}
          disabled={busy || scoreLocked}
          size="small"
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
        <Score
          testId="away"
          value={scores.away}
          minus={
            live && basketsOn ? (
              <MinusOne
                testId="away"
                disabled={busy || scores.away === 0}
                onClick={() => void save({ ...scores, away: Math.max(0, scores.away - 1) })}
              />
            ) : undefined
          }
        />
        {live && basketsOn && (
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
            <ScoreField
              autoFocus
              label={game.homeTeam}
              value={draft?.home ?? ""}
              disabled={busy}
              error={Boolean(error)}
              testId="game-result-dialog-home"
              onChange={(home) => setDraft((prev) => (prev ? { ...prev, home } : prev))}
              onSave={() => void saveDraft()}
            />
            <Typography sx={{ fontWeight: 700, color: "text.secondary", pt: 2.75 }}>–</Typography>
            <ScoreField
              label={game.awayTeam}
              value={draft?.away ?? ""}
              disabled={busy}
              error={Boolean(error)}
              helperText={error}
              testId="game-result-dialog-away"
              onChange={(away) => setDraft((prev) => (prev ? { ...prev, away } : prev))}
              onSave={() => void saveDraft()}
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

function ScoreField({
  autoFocus,
  label,
  value,
  disabled,
  error,
  helperText,
  testId,
  onChange,
  onSave,
}: {
  autoFocus?: boolean
  label: string
  value: string
  disabled: boolean
  error: boolean
  helperText?: string | null
  testId: string
  onChange: (value: string) => void
  onSave: () => void
}) {
  return (
    <TextField
      autoFocus={autoFocus}
      type="number"
      label={label}
      value={value}
      disabled={disabled}
      error={error}
      helperText={helperText}
      onChange={(event) => onChange(event.target.value)}
      onFocus={(event) => event.target.select()}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSave()
      }}
      slotProps={{
        htmlInput: {
          min: 0,
          max: SCORE_MAX,
          "data-testid": testId,
          style: { textAlign: "center" },
        },
      }}
      sx={{ flex: 1, minWidth: 0 }}
    />
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

const pointsGridSx = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr 1fr",
  gap: 0.75,
  alignItems: "center",
}

const pointButtonSx = {
  minWidth: 0,
  minHeight: 44,
  px: 0.5,
  fontSize: "1.05rem",
  fontWeight: 700,
}

function Score({ testId, value, minus }: { testId: string; value: number; minus?: ReactNode }) {
  const number = (
    <Box
      data-testid={`game-result-${testId}-score`}
      sx={{
        textAlign: "center",
        fontSize: "2rem",
        fontWeight: 800,
        lineHeight: 1.1,
        py: 0.25,
        gridColumn: minus ? 2 : undefined,
      }}
    >
      {value}
    </Box>
  )
  if (!minus) return number
  return (
    <Box sx={pointsGridSx}>
      {minus}
      {number}
    </Box>
  )
}

function MinusOne({
  testId,
  disabled,
  onClick,
}: {
  testId: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      data-testid={`game-result-${testId}-remove-1`}
      variant="outlined"
      disabled={disabled}
      onClick={onClick}
      sx={{
        ...pointButtonSx,
        color: "text.secondary",
        borderColor: "divider",
        "&:hover": { borderColor: "grey.400", bgcolor: "action.hover" },
      }}
    >
      -1
    </Button>
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
    <Box sx={pointsGridSx}>
      {[1, 2, 3].map((points) => (
        <Button
          key={points}
          data-testid={`game-result-${testId}-add-${points}`}
          variant="outlined"
          disabled={disabled}
          onClick={() => onAdd(points)}
          sx={pointButtonSx}
        >
          +{points}
        </Button>
      ))}
    </Box>
  )
}
