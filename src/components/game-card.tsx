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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
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
  ExpandMore as ExpandMoreIcon,
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
  gameDivisionId,
  gameDate,
  gameTime,
}: {
  gameId: string
  role: Role
  assignment: OfficialAssignment | null
  teamId: string
  gameDivisionId?: string | null
  gameDate: string
  gameTime: string
}) {
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [anchorWidth, setAnchorWidth] = useState<number | undefined>(undefined)
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

  // Query for loading players (only when menu is open)
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", teamId],
    queryFn: () => getPlayers(teamId),
    enabled: !!anchorEl && (!displayAssignment || !isConfirmed), // Only load when menu open and unconfirmed
  })

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    setAnchorWidth(event.currentTarget.clientWidth || undefined)
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

  const getDialogDefaultName = (type: "guardian" | "pool") => {
    if (!displayAssignment || displayAssignment.handledBy !== type) return ""
    return displayAssignment.confirmedBy ?? ""
  }

  const handleOpenDialog = (type: "guardian" | "pool") => {
    setAnchorEl(null)
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
    setAnchorEl(null)
    setConfirmDialog({
      open: true,
      message: `Poista pelaajan ${assignment?.playerName} toimitsijavastuu tästä ottelusta?`,
      onConfirm: () => mutation.mutate(null),
    })
  }

  const handleUnconfirm = () => {
    setAnchorEl(null)
    if (!displayAssignment) return
    mutation.mutate({
      ...displayAssignment,
      handledBy: null,
      confirmedBy: null,
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
  const playerMenuItems = loadingPlayers ? (
    <MenuItem disabled>
      <CircularProgress size={20} sx={{ mr: 1 }} />
      <ListItemText>Ladataan...</ListItemText>
    </MenuItem>
  ) : players.length === 0 ? (
    <MenuItem key="empty" disabled>
      <ListItemText>
        Ei pelaajia{" "}
        <Typography sx={{ fontSize: "0.8rem" }}>(lisää pelaajia hallinnan kautta)</Typography>
      </ListItemText>
    </MenuItem>
  ) : (
    [...players]
      .sort((a, b) => a.name.localeCompare(b.name, "fi"))
      .map((player) => (
        <MenuItem
          key={player.id}
          onClick={() => handleSelectPlayer(player.name)}
          sx={{ minWidth: "15rem" }}
        >
          <ListItemText>{player.name}</ListItemText>
        </MenuItem>
      ))
  )

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

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: anchorWidth } } }}
      >
        <MenuItem disabled>
          <ListItemText
            primary={[label, gameDivisionId ?? null, `${formatDate(gameDate)} klo ${gameTime}`]
              .filter(Boolean)
              .join(" / ")}
          ></ListItemText>
        </MenuItem>
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
        {displayAssignment?.handledBy === "guardian" && (
          <MenuItem key="guardian-edit" onClick={() => handleOpenDialog("guardian")}>
            <ListItemIcon>
              <GroupIcon color="primary" />
            </ListItemIcon>
            <ListItemText>Muokkaa vuoron tekijän nimeä</ListItemText>
          </MenuItem>
        )}
        {displayAssignment?.handledBy === "pool" && (
          <MenuItem key="pool-edit" onClick={() => handleOpenDialog("pool")}>
            <ListItemIcon>
              <PersonIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>
              {displayAssignment.confirmedBy ? "Muokkaa juniorin nimeä" : "Lisää juniorin nimi"}
            </ListItemText>
          </MenuItem>
        )}
        {displayAssignment && isConfirmed && (
          <MenuItem key="unconfirm" onClick={handleUnconfirm}>
            <ListItemIcon>
              <HourglassEmptyIcon color="warning" />
            </ListItemIcon>
            <ListItemText>Poista vuoron tekijä</ListItemText>
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
        {!displayAssignment && playerMenuItems}
        {/* Change player list - hidden under accordion when unconfirmed */}
        {displayAssignment && !isConfirmed && (
          <Accordion
            disableGutters
            elevation={0}
            square
            sx={{ backgroundColor: "transparent", borderTop: 1, borderColor: "divider" }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">Vaihda pelaaja</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {playerMenuItems}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Menu>

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
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Peruuta</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={dialogType === "guardian" && !name.trim()}
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
            <Typography>
              {formatDate(game.date, { includeWeekday: true })} klo {game.time}
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
              gameDivisionId={game.divisionId}
              gameDate={game.date}
              gameTime={game.time}
            />
            <OfficialButton
              gameId={game.id}
              role="kello"
              assignment={game.officials.kello}
              teamId={game.teamId}
              gameDivisionId={game.divisionId}
              gameDate={game.date}
              gameTime={game.time}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
