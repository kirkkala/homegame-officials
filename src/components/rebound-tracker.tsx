"use client"

import { SportsBasketball as SportsBasketballIcon, Undo as UndoIcon } from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { GameResultForm } from "@/components/game-result-form"
import type { ReboundSide } from "@/db/schema"
import type { ReboundClientAction } from "@/hooks/use-rebounds"
import { getSavedCounterName, setSavedCounterName } from "@/lib/rebound-session"
import { formatReboundUpdatedAt, shortTeamName } from "@/lib/rebounds"
import type { Game, GameResult } from "@/lib/storage"

function ReboundPad({
  testId,
  name,
  count,
  ours,
  role,
  canEdit,
  onAdd,
  onRemove,
}: {
  testId: string
  name: string
  count: number
  ours: boolean
  role: "hyökkäys" | "puolustus"
  canEdit: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
      <Button
        data-testid={testId}
        variant="contained"
        disabled={!canEdit}
        onClick={onAdd}
        sx={{
          minHeight: { xs: 88, sm: 104 },
          width: "100%",
          px: 1.5,
          py: 1.25,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          color: "common.white",
          bgcolor: ours ? "primary.main" : "grey.800",
          "&:hover": { bgcolor: ours ? "primary.dark" : "grey.900" },
          "&.Mui-disabled": {
            color: "common.white",
            bgcolor: ours ? "primary.main" : "grey.800",
            opacity: 0.72,
          },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", opacity: 0.9, lineHeight: 1.2 }}>
          {name}
        </Typography>
        <Typography
          sx={{ fontSize: { xs: "2rem", sm: "2.35rem" }, fontWeight: 800, lineHeight: 1 }}
        >
          {count}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {role}
        </Typography>
      </Button>
      {canEdit && (
        <Button
          data-testid={`${testId}-remove`}
          variant="outlined"
          color="inherit"
          disabled={count === 0}
          onClick={onRemove}
          aria-label={`Vähennä, ${name} ${role}`}
          sx={{
            minHeight: 36,
            py: 0,
            color: "text.secondary",
            borderColor: "divider",
          }}
        >
          <UndoIcon />
        </Button>
      )}
    </Stack>
  )
}

const countSx = {
  width: { xs: "18%", sm: "24%" },
  whiteSpace: "nowrap" as const,
  fontVariantNumeric: "tabular-nums",
}

function BasketHeading({ lines }: { lines: [string, string] }) {
  return (
    <Stack spacing={0.25} sx={{ mb: 1.25 }}>
      {lines.map((line) => (
        <Typography
          key={line}
          variant="subtitle1"
          sx={{ fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.25 }}
        >
          {line}
        </Typography>
      ))}
    </Stack>
  )
}

function StatHead({ label, short }: { label: string; short: string }) {
  return (
    <TableCell
      align="right"
      aria-label={label}
      sx={{
        fontWeight: 700,
        ...countSx,
        fontSize: { xs: "0.75rem", sm: "0.8125rem" },
        lineHeight: 1.2,
      }}
    >
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
        {label}
      </Box>
      <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
        {short}
      </Box>
    </TableCell>
  )
}

export function ReboundTracker({
  game,
  isCounter,
  onAction,
  onSaveResult,
}: {
  game: Game
  isCounter: boolean
  onAction: (action: ReboundClientAction) => Promise<unknown>
  onSaveResult?: (result: GameResult) => Promise<unknown>
}) {
  const rebounds = game.rebounds ?? {
    homeOff: 0,
    homeDef: 0,
    awayOff: 0,
    awayDef: 0,
    counterName: null,
    updatedAt: null,
    counting: false,
    isCounter: false,
  }
  const homeShort = shortTeamName(game.homeTeam)
  const awayShort = shortTeamName(game.awayTeam)
  const homeAttacks: [string, string] = [`${homeShort} hyökkäys`, `${awayShort} puolustus`]
  const awayAttacks: [string, string] = [`${homeShort} puolustus`, `${awayShort} hyökkäys`]

  const [claimOpen, setClaimOpen] = useState(false)
  const [takeOver, setTakeOver] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!claimOpen) return
    setName(getSavedCounterName())
    setError(null)
    const timer = setTimeout(() => nameRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [claimOpen])

  async function run(action: ReboundClientAction) {
    setError(null)
    try {
      await onAction(action)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toiminto epäonnistui")
    }
  }

  async function add(basket: ReboundSide, winner: ReboundSide) {
    if (!isCounter) return
    await run({ action: "add", basket, winner })
  }

  async function remove(basket: ReboundSide, winner: ReboundSide) {
    if (!isCounter) return
    await run({ action: "remove", basket, winner })
  }

  async function handleClaim() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Syötä nimesi")
      return
    }
    setBusy(true)
    setError(null)
    try {
      setSavedCounterName(trimmed)
      await onAction({ action: "claim", name: trimmed, takeOver })
      setClaimOpen(false)
      setTakeOver(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tilastoinnin aloitus epäonnistui")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
        <SportsBasketballIcon color="primary" />
        <Typography variant="h5" component="h2">
          Tilastot
        </Typography>
        {rebounds.counting && rebounds.counterName && (
          <Chip size="small" label={`${rebounds.counterName} kirjaa tilastoa`} />
        )}
        {!isCounter && !rebounds.counting && (
          <Button
            data-testid="rebound-claim"
            variant="contained"
            onClick={() => {
              setTakeOver(false)
              setClaimOpen(true)
            }}
            sx={{ ml: { sm: "auto" } }}
          >
            Käynnistä tilastointi
          </Button>
        )}
        {!isCounter && rebounds.counting && (
          <Button
            data-testid="rebound-takeover"
            variant="outlined"
            onClick={() => {
              setTakeOver(true)
              setClaimOpen(true)
            }}
            sx={{ ml: { sm: "auto" } }}
          >
            Ota haltuun
          </Button>
        )}
        {isCounter && (
          <Button
            data-testid="rebound-release"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={() => void run({ action: "release" })}
            sx={{ ml: { sm: "auto" } }}
          >
            Lopeta tilastojen kirjaus
          </Button>
        )}
      </Stack>

      {onSaveResult && <GameResultForm game={game} onSave={onSaveResult} live={isCounter} />}

      {error && !claimOpen && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <BasketHeading lines={homeAttacks} />
        <Stack direction="row" spacing={1}>
          <ReboundPad
            testId="rebound-btn-home-home"
            name={homeShort}
            count={rebounds.homeOff}
            ours={game.isHomeGame}
            role="hyökkäys"
            canEdit={isCounter}
            onAdd={() => void add("home", "home")}
            onRemove={() => void remove("home", "home")}
          />
          <ReboundPad
            testId="rebound-btn-home-away"
            name={awayShort}
            count={rebounds.awayDef}
            ours={!game.isHomeGame}
            role="puolustus"
            canEdit={isCounter}
            onAdd={() => void add("home", "away")}
            onRemove={() => void remove("home", "away")}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <BasketHeading lines={awayAttacks} />
        <Stack direction="row" spacing={1}>
          <ReboundPad
            testId="rebound-btn-away-home"
            name={homeShort}
            count={rebounds.homeDef}
            ours={game.isHomeGame}
            role="puolustus"
            canEdit={isCounter}
            onAdd={() => void add("away", "home")}
            onRemove={() => void remove("away", "home")}
          />
          <ReboundPad
            testId="rebound-btn-away-away"
            name={awayShort}
            count={rebounds.awayOff}
            ours={!game.isHomeGame}
            role="hyökkäys"
            canEdit={isCounter}
            onAdd={() => void add("away", "away")}
            onRemove={() => void remove("away", "away")}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 } }}>
        <Table
          size="small"
          sx={{
            width: "100%",
            tableLayout: "fixed",
            "& .MuiTableCell-root": { px: { xs: 0.5, sm: 1.5 }, py: 0.75 },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <StatHead label="Hyökkäys" short="Hyök." />
              <StatHead label="Puolustus" short="Puol." />
              <StatHead label="Yhteensä" short="Yht." />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                {game.homeTeam}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {rebounds.homeOff}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {rebounds.homeDef}
              </TableCell>
              <TableCell align="right" sx={{ ...countSx, fontWeight: 700 }}>
                {rebounds.homeOff + rebounds.homeDef}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                {game.awayTeam}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {rebounds.awayOff}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {rebounds.awayDef}
              </TableCell>
              <TableCell align="right" sx={{ ...countSx, fontWeight: 700 }}>
                {rebounds.awayOff + rebounds.awayDef}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {(rebounds.counterName || rebounds.updatedAt) && (
          <Typography
            data-testid="rebound-meta"
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.25 }}
          >
            {[
              rebounds.counterName ? `Tilastoinut ${rebounds.counterName}` : null,
              rebounds.updatedAt ? formatReboundUpdatedAt(rebounds.updatedAt) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        )}
      </Paper>

      <Dialog open={claimOpen} onClose={() => setClaimOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{takeOver ? "Ota tilastointi haltuun" : "Käynnistä tilastointi"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {takeOver
              ? `${rebounds.counterName} pitää tilastoa parhaillaan. Anna nimesi jos otat homman haltuun.`
              : "Vain yksi henkilö voi pitää kirjaa kerrallaan. Syötä nimesi."}
          </Typography>
          <TextField
            inputRef={nameRef}
            label="Nimesi"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError(null)
            }}
            error={!!error}
            helperText={error}
            fullWidth
            autoComplete="name"
            slotProps={{ htmlInput: { "data-testid": "rebound-claim-name" } }}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleClaim()
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimOpen(false)}>Peru</Button>
          <Button
            data-testid="rebound-claim-submit"
            variant="contained"
            onClick={() => void handleClaim()}
            disabled={busy}
          >
            {takeOver ? "Ota haltuun" : "Aloita"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
