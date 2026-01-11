"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
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
import {
  updateOfficial,
  getPlayers,
  type Player,
  type Game,
  type OfficialAssignment,
} from "@/lib/storage"
import { formatDate } from "@/lib/utils"

const ROLES = {
  poytakirja: { label: "Pöytäkirja (eSCO)", Icon: AssignmentIcon },
  kello: { label: "Kello (tulostaulu)", Icon: TimerIcon },
} as const

type Role = "poytakirja" | "kello"

function OfficialButton({
  role,
  assignment,
  onUpdate,
  teamId,
}: {
  role: Role
  assignment: OfficialAssignment | null
  onUpdate: (assignment: OfficialAssignment | null) => void
  teamId: string
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"guardian" | "pool">("guardian")
  const [name, setName] = useState("")
  const { label, Icon } = ROLES[role]

  const isConfirmed = assignment?.handledBy != null

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget
    setLoading(true)
    const loadedPlayers = await getPlayers(teamId)
    setPlayers(loadedPlayers)
    setAnchorEl(target)
    setLoading(false)
  }

  const handleSelectPlayer = (playerName: string) => {
    // Confirm if changing from existing assignment
    if (assignment && assignment.playerName !== playerName) {
      if (!confirm(`Vaihdetaanko ${assignment.playerName} → ${playerName}?`)) {
        setAnchorEl(null)
        return
      }
    }
    onUpdate({ playerName, handledBy: null, confirmedBy: null })
    setAnchorEl(null)
  }

  const handleOpenDialog = (type: "guardian" | "pool") => {
    setAnchorEl(null)
    setDialogType(type)
    setDialogOpen(true)
    setName("")
  }

  const handleConfirm = () => {
    if (assignment) {
      // Huoltaja requires name, pool doesn't
      if (dialogType === "guardian" && !name.trim()) return
      onUpdate({
        ...assignment,
        handledBy: dialogType,
        confirmedBy: name.trim() || null,
      })
      setDialogOpen(false)
    }
  }

  const handleClear = () => {
    if (confirm(`Poistetaanko pelaajan ${assignment?.playerName} vastuu tästä pelistä?`)) {
      onUpdate(null)
    }
    setAnchorEl(null)
  }

  const getButtonColor = () => {
    if (!assignment) return "warning"
    return isConfirmed ? "success" : "info"
  }

  const getStatusLabel = () => {
    if (!assignment?.handledBy) return "Odottaa vahvistusta"
    if (assignment.handledBy === "guardian") {
      return assignment.confirmedBy
    }
    return assignment.confirmedBy ? `${assignment.confirmedBy} (poolista)` : "Juniori poolista"
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={loading}
        startIcon={<Icon />}
        color={getButtonColor()}
        sx={{ flex: 1, justifyContent: "flex-start", textAlign: "left" }}
      >
        <Stack alignItems="flex-start" sx={{ overflow: "hidden" }}>
          <Typography variant="caption">{label}</Typography>
          <Typography variant="body2" fontWeight={assignment ? "bold" : "normal"} noWrap>
            {loading ? "Ladataan..." : assignment?.playerName || "Valitse pelaaja..."}
          </Typography>
          {assignment && (
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
        {assignment && !isConfirmed && (
          <MenuItem key="guardian" onClick={() => handleOpenDialog("guardian")}>
            <ListItemIcon>
              <GroupIcon color="primary" />
            </ListItemIcon>
            <ListItemText>Huoltaja tekee vuoron</ListItemText>
          </MenuItem>
        )}
        {assignment && !isConfirmed && (
          <MenuItem key="pool" onClick={() => handleOpenDialog("pool")}>
            <ListItemIcon>
              <PersonIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>Juniori poolista</ListItemText>
          </MenuItem>
        )}
        {/* Remove option - when player assigned */}
        {assignment && (
          <MenuItem key="clear" onClick={handleClear}>
            <ListItemIcon>
              <ClearIcon color="error" />
            </ListItemIcon>
            <ListItemText>Poista toimitsijavastuu</ListItemText>
          </MenuItem>
        )}
        {/* Player list - only when no assignment yet */}
        {!assignment &&
          (players.length === 0 ? (
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
    </>
  )
}

export function GameCard({ game: initialGame }: { game: Game }) {
  const [game, setGame] = useState(initialGame)

  const handleUpdate = async (role: Role, assignment: OfficialAssignment | null) => {
    const updated = await updateOfficial(game.id, role, assignment)
    setGame(updated)
  }

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
              role="poytakirja"
              assignment={game.officials.poytakirja}
              onUpdate={(a) => handleUpdate("poytakirja", a)}
              teamId={game.teamId}
            />
            <OfficialButton
              role="kello"
              assignment={game.officials.kello}
              onUpdate={(a) => handleUpdate("kello", a)}
              teamId={game.teamId}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
