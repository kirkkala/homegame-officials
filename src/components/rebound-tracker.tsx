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
import type { ReboundSide } from "@/db/schema"
import type { ReboundClientAction } from "@/hooks/use-rebounds"
import { getSavedCounterName, setSavedCounterName } from "@/lib/rebound-session"
import { computeReboundStats, shortTeamName } from "@/lib/rebounds"
import type { Game } from "@/lib/storage"

function CountButton({
  testId,
  name,
  count,
  ours,
  role,
  disabled,
  onClick,
}: {
  testId: string
  name: string
  count: number
  ours: boolean
  role: "hyökkäyspääty" | "puolustuspääty"
  disabled: boolean
  onClick: () => void
}) {
  return (
    <Button
      data-testid={testId}
      variant="contained"
      disabled={disabled}
      onClick={onClick}
      sx={{
        flex: 1,
        minHeight: { xs: 88, sm: 104 },
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
      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", opacity: 0.9, lineHeight: 1.2 }}>
        {name}
      </Typography>
      <Typography sx={{ fontSize: { xs: "2rem", sm: "2.35rem" }, fontWeight: 800, lineHeight: 1 }}>
        {count}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.9 }}>
        {role}
      </Typography>
    </Button>
  )
}

const countSx = {
  width: { xs: "18%", sm: "24%" },
  whiteSpace: "nowrap" as const,
  fontVariantNumeric: "tabular-nums",
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
}: {
  game: Game
  isCounter: boolean
  onAction: (action: ReboundClientAction) => Promise<unknown>
}) {
  const rebounds = game.rebounds ?? { counterName: null, events: [], isCounter: false }
  const stats = computeReboundStats(rebounds.events)
  const homeShort = shortTeamName(game.homeTeam)
  const awayShort = shortTeamName(game.awayTeam)
  const homeAttacks = `${homeShort} hyökkäyspääty / ${awayShort} puolustuspääty`
  const awayAttacks = `${homeShort} puolustuspääty / ${awayShort} hyökkäyspääty`

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
      setError(e instanceof Error ? e.message : "Laskennan aloitus epäonnistui")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <SportsBasketballIcon color="primary" />
        <Typography variant="h5" component="h2">
          Levypallotilasto
        </Typography>
        {rebounds.counterName && (
          <Chip size="small" label={`${rebounds.counterName} kirjaa levypalloja`} />
        )}
      </Stack>

      {!isCounter && !rebounds.counterName && (
        <Button
          data-testid="rebound-claim"
          variant="contained"
          size="large"
          onClick={() => {
            setTakeOver(false)
            setClaimOpen(true)
          }}
        >
          Käynnistä levypallotilaston laskenta
        </Button>
      )}

      {!isCounter && rebounds.counterName && (
        <Button
          data-testid="rebound-takeover"
          variant="outlined"
          onClick={() => {
            setTakeOver(true)
            setClaimOpen(true)
          }}
        >
          Ota haltuun
        </Button>
      )}

      {isCounter && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            data-testid="rebound-undo"
            variant="outlined"
            startIcon={<UndoIcon />}
            disabled={rebounds.events.length === 0}
            onClick={() => void run({ action: "undo" })}
          >
            Peru viimeisin
          </Button>
          <Button
            data-testid="rebound-release"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={() => void run({ action: "release" })}
          >
            Lopeta laskenta
          </Button>
        </Stack>
      )}

      {error && !claimOpen && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
        Kun heitto ei mene koriin, merkitse kumpi joukkue saa pallon.
      </Typography>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.25 }}>
          {homeAttacks}
        </Typography>
        <Stack direction="row" spacing={1}>
          <CountButton
            testId="rebound-btn-home-home"
            name={game.homeTeam}
            count={stats.home.ownWon}
            ours={game.isHomeGame}
            role="hyökkäyspääty"
            disabled={!isCounter}
            onClick={() => void add("home", "home")}
          />
          <CountButton
            testId="rebound-btn-home-away"
            name={game.awayTeam}
            count={stats.home.ownLost}
            ours={!game.isHomeGame}
            role="puolustuspääty"
            disabled={!isCounter}
            onClick={() => void add("home", "away")}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.25 }}>
          {awayAttacks}
        </Typography>
        <Stack direction="row" spacing={1}>
          <CountButton
            testId="rebound-btn-away-home"
            name={game.homeTeam}
            count={stats.home.oppWon}
            ours={game.isHomeGame}
            role="puolustuspääty"
            disabled={!isCounter}
            onClick={() => void add("away", "home")}
          />
          <CountButton
            testId="rebound-btn-away-away"
            name={game.awayTeam}
            count={stats.home.oppLost}
            ours={!game.isHomeGame}
            role="hyökkäyspääty"
            disabled={!isCounter}
            onClick={() => void add("away", "away")}
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
                {stats.home.ownWon}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {stats.home.oppWon}
              </TableCell>
              <TableCell align="right" sx={{ ...countSx, fontWeight: 700 }}>
                {stats.home.total}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                {game.awayTeam}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {stats.away.ownWon}
              </TableCell>
              <TableCell align="right" sx={countSx}>
                {stats.away.oppWon}
              </TableCell>
              <TableCell align="right" sx={{ ...countSx, fontWeight: 700 }}>
                {stats.away.total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={claimOpen} onClose={() => setClaimOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>
          {takeOver ? "Ota tilaston laskenta haltuun" : "Käynnistä levypallotilaston laskenta"}
        </DialogTitle>
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
            {takeOver ? "Ota haltuun" : "Aloita laskenta"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
