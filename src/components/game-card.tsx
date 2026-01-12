"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
} from "@mui/icons-material"
import { updateOfficial, getPlayers, type Game, type OfficialAssignment } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

const ROLES = {
  poytakirja: { label: "Pöytäkirja (eSCO)", Icon: AssignmentIcon },
  kello: { label: "Kello (tulostaulu)", Icon: TimerIcon },
} as const

type Role = "poytakirja" | "kello"

function OfficialButton({
  gameId,
  role,
  assignment,
  teamId,
}: {
  gameId: string
  role: Role
  assignment: OfficialAssignment | null
  teamId: string
}) {
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"guardian" | "pool">("guardian")
  const [name, setName] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    message: string
    onConfirm: () => void
  }>({ open: false, message: "", onConfirm: () => {} })
  const { label, Icon } = ROLES[role]

  // Mutation for updating official
  const mutation = useMutation({
    mutationFn: (newAssignment: OfficialAssignment | null) =>
      updateOfficial(gameId, role, newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] })
    },
  })

  // Use mutation data until prop catches up (prevents flicker after save)
  const isPropStale =
    mutation.isSuccess && assignment?.playerName !== mutation.variables?.playerName
  const displayAssignment = mutation.isPending || isPropStale ? mutation.variables : assignment
  const isConfirmed = displayAssignment?.handledBy != null

  // Query for loading players (only when menu is open)
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", teamId],
    queryFn: () => getPlayers(teamId),
    enabled: !!anchorEl && !displayAssignment, // Only load when menu open and no assignment
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleSelectPlayer = (playerName: string) => {
    if (assignment && assignment.playerName !== playerName) {
      setAnchorEl(null)
      setConfirmDialog({
        open: true,
        message: `Vaihdetaanko ${assignment.playerName} → ${playerName}?`,
        onConfirm: () => mutation.mutate({ playerName, handledBy: null, confirmedBy: null }),
      })
      return
    }
    setAnchorEl(null)
    mutation.mutate({ playerName, handledBy: null, confirmedBy: null })
  }

  const handleOpenDialog = (type: "guardian" | "pool") => {
    setAnchorEl(null)
    setDialogType(type)
    setDialogOpen(true)
    setName("")
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
    setAnchorEl(null)
    setConfirmDialog({
      open: true,
      message: `Poista pelaajan ${assignment?.playerName} toimitsijavastuu tästä ottelusta?`,
      onConfirm: () => mutation.mutate(null),
    })
  }

  const getButtonColor = () => {
    if (!displayAssignment) return "warning"
    return isConfirmed ? "success" : "info"
  }

  const getStatusLabel = () => {
    if (!displayAssignment?.handledBy) return "Odottaa vahvistusta"
    if (displayAssignment.handledBy === "guardian") {
      return displayAssignment.confirmedBy
    }
    return displayAssignment.confirmedBy
      ? `${displayAssignment.confirmedBy} (poolista)`
      : "Juniori poolista"
  }

  const isBusy = mutation.isPending || isPropStale

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={isBusy}
        startIcon={isBusy ? <CircularProgress size={20} color="inherit" /> : <Icon />}
        color={getButtonColor()}
        sx={{ flex: 1, justifyContent: "flex-start", textAlign: "left" }}
      >
        <Stack alignItems="flex-start" sx={{ overflow: "hidden" }}>
          <Typography variant="caption">{label}</Typography>
          <Typography variant="body2" fontWeight={displayAssignment ? "bold" : "normal"} noWrap>
            {isBusy ? "Tallennetaan..." : displayAssignment?.playerName || "Valitse pelaaja..."}
          </Typography>
          {displayAssignment && !isBusy && (
            <Box sx={{ my: 0.5 }}>
              <Chip
                label={getStatusLabel()}
                size="small"
                color={isConfirmed ? "success" : "warning"}
                icon={isConfirmed ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
              />
            </Box>
          )}
        </Stack>
      </Button>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {/* Confirmation options - only when player assigned but not yet confirmed */}
        {displayAssignment && !isConfirmed && (
          <MenuItem key="guardian" onClick={() => handleOpenDialog("guardian")}>
            <ListItemIcon>
              <GroupIcon color="primary" />
            </ListItemIcon>
            <ListItemText>Huoltaja tekee vuoron</ListItemText>
          </MenuItem>
        )}
        {displayAssignment && !isConfirmed && (
          <MenuItem key="pool" onClick={() => handleOpenDialog("pool")}>
            <ListItemIcon>
              <PersonIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>Juniori poolista</ListItemText>
          </MenuItem>
        )}
        {/* Remove option - when player assigned */}
        {displayAssignment && (
          <MenuItem key="clear" onClick={handleClear}>
            <ListItemIcon>
              <ClearIcon color="error" />
            </ListItemIcon>
            <ListItemText>Poista toimitsijavastuu</ListItemText>
          </MenuItem>
        )}
        {/* Player list - only when no assignment yet */}
        {!displayAssignment &&
          (loadingPlayers ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <ListItemText>Ladataan...</ListItemText>
            </MenuItem>
          ) : players.length === 0 ? (
            <MenuItem key="empty" disabled>
              <ListItemText>
                Ei pelaajia{" "}
                <Typography sx={{ fontSize: "0.8rem" }}>
                  (lisää pelaajia hallinnan kautta)
                </Typography>
              </ListItemText>
            </MenuItem>
          ) : (
            [...players]
              .sort((a, b) => a.name.localeCompare(b.name, "fi"))
              .map((player) => (
                <MenuItem key={player.id} onClick={() => handleSelectPlayer(player.name)}>
                  <ListItemText>{player.name}</ListItemText>
                </MenuItem>
              ))
          ))}
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialogType === "guardian" ? "Huoltaja tekee vuoron" : "Juniori poolista"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {dialogType === "guardian" ? (
              <>
                Kuka hoitaa pelaajan <strong>{assignment?.playerName}</strong> toimitsijavuoron?
              </>
            ) : (
              <>
                Juniori poolista hoitaa pelaajan <strong>{assignment?.playerName}</strong>{" "}
                toimitsija-vuoron. Nimi on valinnainen.
              </>
            )}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label={dialogType === "guardian" ? "Huoltajan nimi" : "Juniorin nimi (valinnainen)"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Peruuta</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={dialogType === "guardian" && !name.trim()}
          >
            Vahvista
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
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
    </>
  )
}

export function GameCard({ game, isPast = false }: { game: Game; isPast?: boolean }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        {/* Mobile layout: stacked */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          {/* Top row: Date, time, division */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                {formatDate(game.date)}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {game.time}
              </Typography>
              {isPast && <Chip label="Pelattu" size="small" sx={{ ml: 0.5, fontSize: "0.7rem" }} />}
            </Stack>
            {game.divisionId && (
              <Chip
                label={game.divisionId}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "grey.200", color: "grey.800" }}
              />
            )}
          </Stack>

          {/* Teams */}
          <Typography
            variant="body1"
            fontWeight={game.isHomeGame ? "bold" : "normal"}
            sx={{ mb: 1, lineHeight: 1.3 }}
          >
            {game.homeTeam}
            <Typography component="span" color="text.secondary" sx={{ mx: 0.5 }}>
              vs.
            </Typography>
            {game.awayTeam}
          </Typography>
        </Box>

        {/* Desktop layout: horizontal */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
              {game.divisionId && (
                <Chip
                  label={game.divisionId}
                  size="small"
                  sx={{ fontWeight: 600, bgcolor: "grey.200", color: "grey.800" }}
                />
              )}
              <Typography variant="body2" fontWeight={game.isHomeGame ? "bold" : "normal"} noWrap>
                {game.homeTeam} vs. {game.awayTeam}
              </Typography>
              {isPast && <Chip label="Pelattu" size="small" sx={{ fontSize: "0.75rem" }} />}
            </Stack>
            <Stack direction="row" alignItems="center" gap={2} sx={{ flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDate(game.date)}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {game.time}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Officials section - only for home games */}
        {game.isHomeGame && (
          <Stack direction={{ xs: "column", sm: "row" }} gap={1} sx={{ mt: { xs: 0, sm: 1.5 } }}>
            <OfficialButton
              gameId={game.id}
              role="poytakirja"
              assignment={game.officials.poytakirja}
              teamId={game.teamId}
            />
            <OfficialButton
              gameId={game.id}
              role="kello"
              assignment={game.officials.kello}
              teamId={game.teamId}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
