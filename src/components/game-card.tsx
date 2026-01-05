"use client"

import { useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import Button from "@mui/material/Button"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import Box from "@mui/material/Box"
import AssignmentIcon from "@mui/icons-material/Assignment"
import TimerIcon from "@mui/icons-material/Timer"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import PersonIcon from "@mui/icons-material/Person"
import GroupIcon from "@mui/icons-material/Group"
import ClearIcon from "@mui/icons-material/Clear"
import {
  updateOfficial,
  getPlayers,
  type Player,
  type Game,
  type OfficialAssignment,
} from "@/lib/storage"
import { formatDate } from "@/lib/utils"

const ROLES = {
  poytakirja: { label: "Pöytäkirja", Icon: AssignmentIcon },
  kello: { label: "Kello", Icon: TimerIcon },
} as const

type Role = "poytakirja" | "kello"

function OfficialButton({
  role,
  assignment,
  onUpdate,
}: {
  role: Role
  assignment: OfficialAssignment | null
  onUpdate: (assignment: OfficialAssignment | null) => void
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
    const loadedPlayers = await getPlayers()
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
            <Box sx={{ mt: 0.5 }}>
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
        {[
          assignment && !isConfirmed && (
            <MenuItem key="guardian" onClick={() => handleOpenDialog("guardian")}>
              <ListItemIcon>
                <GroupIcon color="primary" />
              </ListItemIcon>
              <ListItemText>Huoltaja tekee vuoron</ListItemText>
            </MenuItem>
          ),
          assignment && !isConfirmed && (
            <MenuItem key="pool" onClick={() => handleOpenDialog("pool")}>
              <ListItemIcon>
                <PersonIcon color="secondary" />
              </ListItemIcon>
              <ListItemText>Juniori poolista</ListItemText>
            </MenuItem>
          ),
          assignment && (
            <MenuItem key="clear" onClick={handleClear}>
              <ListItemIcon>
                <ClearIcon color="error" />
              </ListItemIcon>
              <ListItemText>Poista valittu pelaaja</ListItemText>
            </MenuItem>
          ),
          // Only show player list when no assignment yet or when already confirmed
          !assignment && players.length === 0 && (
            <MenuItem key="empty" disabled>
              <ListItemText>Ei pelaajia</ListItemText>
            </MenuItem>
          ),
          ...(!assignment || isConfirmed
            ? [...players]
                .sort((a, b) => a.name.localeCompare(b.name, "fi"))
                .map((player) => (
                  <MenuItem
                    key={player.id}
                    onClick={() => handleSelectPlayer(player.name)}
                    selected={assignment?.playerName === player.name}
                  >
                    <ListItemText inset>{player.name}</ListItemText>
                  </MenuItem>
                ))
            : []),
        ].filter(Boolean)}
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

  const isComplete = (a: OfficialAssignment | null) => a?.handledBy != null
  const allConfirmed = isComplete(game.officials.poytakirja) && isComplete(game.officials.kello)
  const hasAssignments = game.officials.poytakirja || game.officials.kello

  const handleUpdate = async (role: Role, assignment: OfficialAssignment | null) => {
    const updated = await updateOfficial(game.id, role, assignment)
    setGame(updated)
  }

  const statusChip = game.isHomeGame ? (
    <Chip
      label={
        allConfirmed ? "Toimitsijat vahvistettu" : hasAssignments ? "Odottaa" : "Ei toimitsijaa"
      }
      size="small"
      color={allConfirmed ? "success" : hasAssignments ? "warning" : "error"}
      icon={
        allConfirmed ? <CheckCircleIcon /> : hasAssignments ? <HourglassEmptyIcon /> : undefined
      }
    />
  ) : (
    <Chip label="Vierasottelu" size="small" color="default" />
  )

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        {/* Header row - same for both home and away */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
            {game.divisionId && (
              <Chip
                label={game.divisionId}
                size="small"
                color={game.isHomeGame ? "primary" : "default"}
                variant="outlined"
              />
            )}
            {statusChip}
            <Typography variant="body2" fontWeight={game.isHomeGame ? "bold" : "normal"} noWrap>
              {game.homeTeam} vs {game.awayTeam}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={2} sx={{ flexShrink: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {formatDate(game.date)}
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={game.isHomeGame ? "primary" : "text.primary"}
            >
              {game.time}
            </Typography>
          </Stack>
        </Stack>

        {/* Officials section - only for home games */}
        {game.isHomeGame && (
          <Stack direction={{ xs: "column", sm: "row" }} gap={1} mt={1.5}>
            <OfficialButton
              role="poytakirja"
              assignment={game.officials.poytakirja}
              onUpdate={(a) => handleUpdate("poytakirja", a)}
            />
            <OfficialButton
              role="kello"
              assignment={game.officials.kello}
              onUpdate={(a) => handleUpdate("kello", a)}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
