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
  LaptopChromebook as LaptopChromebookIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
} from "@mui/icons-material"
import { updateOfficial, getPlayers, type Game, type OfficialAssignment } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

const ROLES = {
  poytakirja: { label: "Pöytäkirja (eSCO)", Icon: LaptopChromebookIcon },
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
  const isUnassigned = !displayAssignment

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
    if (isUnassigned) return "warning"
    return isConfirmed ? "success" : "warning"
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
        startIcon={isBusy ? <CircularProgress size={20} color="inherit" /> : false}
        color={getButtonColor()}
        sx={{
          flex: 1,
          justifyContent: "flex-start",
          textAlign: "left",
          pt: 2,
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
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: "bold" }} noWrap>
              {isBusy ? "Tallennetaan..." : displayAssignment?.playerName || "Valitse pelaaja..."}
            </Typography>
            {displayAssignment && !isBusy && (
              <Chip
                label={getStatusLabel()}
                size="small"
                color={isConfirmed ? "success" : "warning"}
                icon={isConfirmed ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
              />
            )}
          </Stack>
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
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
          "& .MuiTypography-root": { marginTop: 0, marginBottom: 0 },
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
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ gridArea: "meta" }}>
            {game.divisionId && (
              <Chip label={game.divisionId} size="small" sx={{ fontWeight: 600 }} />
            )}
            {isPast && (
              <Chip label="Pelattu" size="small" sx={{ fontSize: "0.7rem", lineHeight: 1.4 }} />
            )}
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              {formatDate(game.date)} klo {game.time}
            </Typography>
          </Stack>

          {game.location && (
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              sx={{ gridArea: "location", justifySelf: { xs: "flex-start", sm: "flex-end" } }}
            >
              <PlaceIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign={{ xs: "left", sm: "right" }}
              >
                {game.location}
              </Typography>
            </Stack>
          )}

          <Typography
            variant="body1"
            fontWeight={game.isHomeGame ? "bold" : "normal"}
            sx={{ gridArea: "teams", lineHeight: 1.3, textAlign: { xs: "left", sm: "left" } }}
          >
            {game.homeTeam}
            <Typography component="span" color="text.secondary" sx={{ mx: 0.5 }}>
              vs.
            </Typography>
            {game.awayTeam}
          </Typography>
        </Box>

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
