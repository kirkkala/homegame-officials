"use client"

import {
  ExpandMore as ExpandMoreIcon,
  SportsBasketball as SportsBasketballIcon,
  Undo as UndoIcon,
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
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
import {
  getReboundHelpOpen,
  getSavedCounterName,
  setReboundHelpOpen,
  setSavedCounterName,
} from "@/lib/rebound-session"
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
          aria-label={`Poista yksi, ${name} ${role}`}
          sx={{
            minHeight: 36,
            py: 0,
            px: 1,
            gap: 0.5,
            color: "text.secondary",
            borderColor: "divider",
            fontSize: "0.85rem",
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          <UndoIcon sx={{ fontSize: 14 }} />
          -1
        </Button>
      )}
    </Stack>
  )
}

function ReboundSection({ isCounter }: { isCounter: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(getReboundHelpOpen())
  }, [])

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}>
          Levypallot
        </Typography>
        {isCounter && (
          <Button
            data-testid="rebound-help"
            size="small"
            aria-expanded={open}
            aria-controls="rebound-help-text"
            onClick={() => {
              const next = !open
              setOpen(next)
              setReboundHelpOpen(next)
            }}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  fontSize: 18,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: (theme) =>
                    theme.transitions.create("transform", {
                      duration: theme.transitions.duration.shortest,
                    }),
                }}
              />
            }
            sx={{ flexShrink: 0, minHeight: 32, px: 1, textTransform: "none", fontWeight: 600 }}
          >
            {open ? "Sulje ohje" : "Näytä ohje"}
          </Button>
        )}
      </Stack>
      {isCounter && (
        <Collapse in={open} unmountOnExit>
          <Box id="rebound-help-text" sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Merkitse levypallot painamalla sen joukkueen nappia, joka sai pallon. Ylärivi on
              kotijoukkueen hyökkäyspääty ja alarivi vierasjoukkueen.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Virheellisen merkinnän voit poistaa -1 painikkeesta ison napin alla.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Muista painaa "Lopeta/tallenna" painiketta kun peli on päättynyt.
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  )
}

function SessionButtons({
  isCounter,
  counting,
  busy,
  onClaim,
  onTakeOver,
  onRelease,
}: {
  isCounter: boolean
  counting: boolean
  busy: boolean
  onClaim: () => void
  onTakeOver: () => void
  onRelease: () => void
}) {
  if (isCounter) {
    return (
      <Button
        data-testid="rebound-release"
        variant="outlined"
        color="inherit"
        disabled={busy}
        onClick={onRelease}
      >
        Lopeta/tallenna
      </Button>
    )
  }
  if (counting) {
    return (
      <Button data-testid="rebound-takeover" variant="outlined" onClick={onTakeOver}>
        Ota haltuun
      </Button>
    )
  }
  return (
    <Button data-testid="rebound-claim" variant="contained" onClick={onClaim}>
      Käynnistä tilastointi
    </Button>
  )
}

const countSx = {
  width: { xs: "18%", sm: "24%" },
  whiteSpace: "nowrap" as const,
  fontVariantNumeric: "tabular-nums",
}

function BasketHeading({ children }: { children: string }) {
  return (
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.25, mb: 1.25 }}
    >
      {children}
    </Typography>
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
    trackBaskets: false,
  }
  const homeShort = shortTeamName(game.homeTeam)
  const awayShort = shortTeamName(game.awayTeam)

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

  const sessionButtons = (
    <SessionButtons
      isCounter={isCounter}
      counting={rebounds.counting}
      busy={busy}
      onClaim={() => {
        setTakeOver(false)
        setClaimOpen(true)
      }}
      onTakeOver={() => {
        setTakeOver(true)
        setClaimOpen(true)
      }}
      onRelease={() => void run({ action: "release" })}
    />
  )

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
      </Stack>

      {onSaveResult ? (
        <GameResultForm
          game={game}
          onSave={onSaveResult}
          live={isCounter}
          trackBaskets={rebounds.trackBaskets}
          onTrackBaskets={
            isCounter ? (enabled) => run({ action: "trackBaskets", enabled }) : undefined
          }
          sessionControl={sessionButtons}
        />
      ) : (
        sessionButtons
      )}

      {error && !claimOpen && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ReboundSection isCounter={isCounter} />

      <Stack>
        <BasketHeading>Kotijoukkueen hyökkäyspääty</BasketHeading>
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
      </Stack>

      <Stack>
        <BasketHeading>Vierasjoukkueen hyökkäyspääty</BasketHeading>
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
      </Stack>

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
              ? `${rebounds.counterName} pitää parhaillaantilastoa. Anna nimesi jos otat homman haltuun.`
              : "Vain yksi henkilö kerrallaan voi kirjata levypalloja. Syötä nimesi."}
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
