"use client"

import {
  AvTimer as AvTimerIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  HourglassEmpty as HourglassEmptyIcon,
  LaptopChromebook as LaptopChromebookIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
  Timer as TimerIcon,
} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { getPlayers, type OfficialAssignment, type Player, updateOfficial } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

export const ROLES = {
  poytakirja: { label: "Pöytäkirja (eSCO)", Icon: LaptopChromebookIcon },
  kello: { label: "Kello (tulostaulu)", Icon: TimerIcon },
  hyokkaysaika: { label: "Hyökkäysaika (24 s)", Icon: AvTimerIcon },
} as const

export type Role = "poytakirja" | "kello" | "hyokkaysaika"

/** Searchable player list, shared by the initial selection and the "change player" flows. */
function PlayerPicker({
  players,
  loading,
  playerStats,
  onSelect,
}: {
  players: Player[]
  loading: boolean
  playerStats?: Map<string, number>
  onSelect: (playerName: string) => void
}) {
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the search once players are available. Runs after the dialog/accordion
  // has mounted the field (via rAF, so it wins over the Dialog's initial focus).
  useEffect(() => {
    if (loading || players.length === 0) return
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [loading, players.length])

  if (loading) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Ladataan...</Typography>
      </Stack>
    )
  }

  if (players.length === 0) {
    return (
      <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>
        Ei pelaajia{" "}
        <Typography component="span" sx={{ fontSize: "0.8rem" }}>
          (lisää pelaajia hallinnan kautta)
        </Typography>
      </Typography>
    )
  }

  const query = search.trim().toLowerCase()
  const filtered = [...players]
    .filter((player) => player.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name, "fi"))

  return (
    <>
      <Box sx={{ px: 1.5, pb: 1 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          placeholder="Hae pelaajaa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { "data-testid": "official-player-search" },
          }}
        />
      </Box>
      <List
        disablePadding
        sx={{ display: "flex", flexDirection: "column", maxHeight: 240, overflowY: "auto" }}
      >
        {filtered.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>Ei hakua vastaavia pelaajia</ListItemText>
          </MenuItem>
        ) : (
          filtered.map((player) => {
            const shiftCount = playerStats?.get(player.name) ?? 0
            return (
              <MenuItem
                key={player.id}
                onClick={() => onSelect(player.name)}
                data-testid={`official-player-${player.id}`}
              >
                <ListItemText>{player.name}</ListItemText>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {shiftCount}
                </Typography>
              </MenuItem>
            )
          })
        )}
      </List>
    </>
  )
}

export function OfficialAssigner({
  gameId,
  role,
  assignment,
  teamId,
  gameName,
  gameDivisionId,
  gameDate,
  gameTime,
  playerStats,
}: {
  gameId: string
  role: Role
  assignment: OfficialAssignment | null
  teamId: string
  gameName: string
  gameDivisionId?: string | null
  gameDate: string
  gameTime: string
  playerStats?: Map<string, number>
}) {
  const queryClient = useQueryClient()
  const [selectionOpen, setSelectionOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"guardian" | "pool">("guardian")
  const [name, setName] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => void
  }>({ open: false, message: "", onConfirm: () => {} })
  const { label, Icon } = ROLES[role]

  // Mutation for updating official
  const mutation = useMutation({
    mutationFn: (newAssignment: OfficialAssignment | null) =>
      updateOfficial(gameId, teamId, role, newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Toimitsijavastuun päivitys epäonnistui"
      setErrorMessage(message)
    },
  })

  // Use mutation data until prop catches up (prevents flicker after save)
  const isPropStale =
    mutation.isSuccess && assignment?.playerName !== mutation.variables?.playerName
  const displayAssignment = mutation.isPending || isPropStale ? mutation.variables : assignment
  const isConfirmed = displayAssignment?.handledBy != null
  const isUnassigned = !displayAssignment

  // Query for loading players (only when selection dialog is open)
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", teamId],
    queryFn: () => getPlayers(teamId),
    enabled: selectionOpen && (!displayAssignment || !isConfirmed), // Only load when open and unconfirmed
  })

  const handleSelectPlayer = (playerName: string) => {
    if (assignment && assignment.playerName !== playerName) {
      setSelectionOpen(false)
      setConfirmDialog({
        open: true,
        message: `Vaihda ${assignment.playerName} → ${playerName}?`,
        onConfirm: () => mutation.mutate({ playerName, handledBy: null, confirmedBy: null }),
      })
      return
    }
    setSelectionOpen(false)
    mutation.mutate({ playerName, handledBy: null, confirmedBy: null })
  }

  const getDialogDefaultName = (type: "guardian" | "pool") => {
    if (!displayAssignment || displayAssignment.handledBy !== type) return ""
    return displayAssignment.confirmedBy ?? ""
  }

  const handleOpenDialog = (type: "guardian" | "pool") => {
    setSelectionOpen(false)
    setDialogType(type)
    setDialogOpen(true)
    setName(getDialogDefaultName(type))
  }

  const handleConfirm = () => {
    if (assignment) {
      if (dialogType === "guardian" && !name.trim()) return
      setDialogOpen(false)
      mutation.mutate({
        ...assignment,
        handledBy: dialogType,
        confirmedBy: name.trim() || null,
      })
    }
  }

  const handleClear = () => {
    setSelectionOpen(false)
    setConfirmDialog({
      open: true,
      message: `Poista pelaajan ${assignment?.playerName} toimitsijavastuu tästä ottelusta?`,
      onConfirm: () => mutation.mutate(null),
    })
  }

  const handleUnconfirm = () => {
    setSelectionOpen(false)
    if (!displayAssignment) return
    mutation.mutate({
      ...displayAssignment,
      handledBy: null,
      confirmedBy: null,
    })
  }

  // Green once a handler is confirmed, amber while still pending/unassigned.
  const statusColor = isConfirmed ? "success" : "warning"

  const getStatusLabel = () => {
    if (!displayAssignment?.handledBy) return "Vahvista"
    if (displayAssignment.handledBy === "guardian") {
      return displayAssignment.confirmedBy
    }
    return displayAssignment.confirmedBy
      ? `${displayAssignment.confirmedBy} (poolista)`
      : "Juniori poolista"
  }

  const getActionHeading = () => {
    if (isUnassigned) return "Valitse pelaaja"
    if (!isConfirmed) return "Vahvista vuoron tekijä"
    return "Muokkaa toimitsijavuoroa"
  }

  const isBusy = mutation.isPending || isPropStale

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setSelectionOpen(true)}
        disabled={isBusy}
        startIcon={isBusy ? <CircularProgress size={20} color="inherit" /> : false}
        color={statusColor}
        data-testid={`official-button-${role}`}
        sx={{
          flex: 1,
          justifyContent: "flex-start",
          textAlign: "left",
          pl: 2,
          py: 2,
          ...(isUnassigned && {
            color: "text.secondary",
            borderColor: "text.secondary",
            "&:hover": {
              color: "text.primary",
              borderColor: "text.primary",
            },
          }),
        }}
      >
        <Stack alignItems="flex-start" sx={{ overflow: "hidden" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon sx={{ verticalAlign: "middle" }} />
            <Typography>{label}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1 }}>
            <Typography sx={{ fontWeight: "bold" }} noWrap>
              {isBusy ? "Tallennetaan..." : displayAssignment?.playerName || "Valitse pelaaja..."}
            </Typography>
            {displayAssignment && !isBusy && (
              <Chip
                label={getStatusLabel()}
                size="small"
                color={statusColor}
                icon={isConfirmed ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
              />
            )}
          </Stack>
        </Stack>
      </Button>

      <Dialog
        open={selectionOpen}
        onClose={() => setSelectionOpen(false)}
        data-testid={`official-menu-${role}`}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ px: 1.5, pt: 2.5, pb: 1.5 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
              <Icon sx={{ mt: 0.5, color: "text.secondary", flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {getActionHeading()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {[gameDivisionId ?? null, `${formatDate(gameDate)} klo ${gameTime}`]
                    .filter(Boolean)
                    .join(" / ")}
                </Typography>
                <Typography variant="body2">{gameName}</Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              aria-label="Sulje valikko"
              onClick={() => setSelectionOpen(false)}
            >
              <CloseIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 0, pt: 1, pb: 1.5 }}>
          <List disablePadding>
            {/* Confirmation options - only when player assigned but not yet confirmed */}
            {displayAssignment && !isConfirmed && (
              <MenuItem
                key="guardian"
                onClick={() => handleOpenDialog("guardian")}
                data-testid="official-confirm-guardian"
              >
                <ListItemIcon>
                  <GroupIcon color="primary" />
                </ListItemIcon>
                <ListItemText>Huoltaja tekee vuoron</ListItemText>
              </MenuItem>
            )}
            {displayAssignment && !isConfirmed && (
              <MenuItem
                key="pool"
                onClick={() => handleOpenDialog("pool")}
                data-testid="official-confirm-pool"
              >
                <ListItemIcon>
                  <PersonIcon color="secondary" />
                </ListItemIcon>
                <ListItemText>Juniori poolista</ListItemText>
              </MenuItem>
            )}
            {displayAssignment?.handledBy === "guardian" && (
              <MenuItem
                key="guardian-edit"
                onClick={() => handleOpenDialog("guardian")}
                data-testid="official-edit-guardian"
              >
                <ListItemIcon>
                  <GroupIcon color="primary" />
                </ListItemIcon>
                <ListItemText>Muokkaa vuoron tekijän nimeä</ListItemText>
              </MenuItem>
            )}
            {displayAssignment?.handledBy === "pool" && (
              <MenuItem
                key="pool-edit"
                onClick={() => handleOpenDialog("pool")}
                data-testid="official-edit-pool"
              >
                <ListItemIcon>
                  <PersonIcon color="secondary" />
                </ListItemIcon>
                <ListItemText>
                  {displayAssignment.confirmedBy ? "Muokkaa juniorin nimeä" : "Lisää juniorin nimi"}
                </ListItemText>
              </MenuItem>
            )}
            {displayAssignment && isConfirmed && (
              <MenuItem key="unconfirm" onClick={handleUnconfirm} data-testid="official-unconfirm">
                <ListItemIcon>
                  <HourglassEmptyIcon color="warning" />
                </ListItemIcon>
                <ListItemText>Poista vuoron tekijä</ListItemText>
              </MenuItem>
            )}
            {/* Remove option - when player assigned */}
            {displayAssignment && (
              <MenuItem key="clear" onClick={handleClear} data-testid="official-clear">
                <ListItemIcon>
                  <ClearIcon color="error" />
                </ListItemIcon>
                <ListItemText>Poista toimitsijavastuu</ListItemText>
              </MenuItem>
            )}
          </List>
          {/* Player list - only when no assignment yet */}
          {!displayAssignment && (
            <PlayerPicker
              players={players}
              loading={loadingPlayers}
              playerStats={playerStats}
              onSelect={handleSelectPlayer}
            />
          )}
          {/* Change player list - hidden under accordion when unconfirmed */}
          {displayAssignment && !isConfirmed && (
            <Accordion
              disableGutters
              elevation={0}
              square
              slotProps={{ transition: { unmountOnExit: true } }}
              sx={{ backgroundColor: "transparent", borderTop: 1, borderColor: "divider" }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SwapHorizIcon fontSize="small" color="action" />
                  <Typography variant="body2">Vaihda pelaajavastuu</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pb: 1 }}>
                <PlayerPicker
                  players={players}
                  loading={loadingPlayers}
                  playerStats={playerStats}
                  onSelect={handleSelectPlayer}
                />
              </AccordionDetails>
            </Accordion>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault()
            if (dialogType === "guardian" && !name.trim()) return
            handleConfirm()
          }}
        >
          <DialogContent>
            {dialogType === "guardian" ? (
              <Typography variant="body2">
                Huoltajan nimi joka hoitaa pelaajan <strong>{assignment?.playerName}</strong>{" "}
                toimitsijavuoron.
              </Typography>
            ) : (
              <>
                <Typography variant="body2">
                  Juniori poolista tekee pelaajan <strong>{assignment?.playerName}</strong>{" "}
                  toimitsijavuorovastuu <strong>20&nbsp;€</strong> korvausta vastaan.
                </Typography>
                <Typography variant="body2">
                  Jojo pyytää vuoroon tekijän ja huoltaja/vanhempi huolehtii korvauksen maksusta
                  jojon välityksellä. Maksu menee kokonaisuudessaan toimitsijavuoron tehneelle
                  juniorille.
                </Typography>
              </>
            )}
            <TextField
              autoFocus
              fullWidth
              label={
                dialogType === "guardian"
                  ? "Huoltajan/vuoron tekijän nimi"
                  : "Juniorin nimi (valinnainen)"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              inputProps={{ "data-testid": "official-confirm-input" }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Peruuta</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={dialogType === "guardian" && !name.trim()}
              data-testid="official-confirm-submit"
            >
              Vahvista
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ pb: 0.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon fontSize="small" sx={{ color: "text.secondary" }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {gameName}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
            Peruuta
          </Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm()
              setConfirmDialog((prev) => ({ ...prev, open: false }))
            }}
            color="error"
            autoFocus
          >
            Kyllä
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
