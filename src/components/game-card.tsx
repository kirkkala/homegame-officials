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
import Divider from "@mui/material/Divider"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import AssignmentIcon from "@mui/icons-material/Assignment"
import TimerIcon from "@mui/icons-material/Timer"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ClearIcon from "@mui/icons-material/Clear"
import { assignOfficial, getPlayers, type Player, type Game } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

const ROLES = {
  poytakirja: { label: "Pöytäkirja", Icon: AssignmentIcon },
  kello: { label: "Kello", Icon: TimerIcon },
} as const

function OfficialButton({
  role,
  name,
  onAssign,
}: {
  role: "poytakirja" | "kello"
  name: string | null
  onAssign: (playerName: string | null) => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const { label, Icon } = ROLES[role]

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const target = event.currentTarget
    setLoading(true)
    const loadedPlayers = await getPlayers()
    setPlayers(loadedPlayers)
    setAnchorEl(target)
    setLoading(false)
  }

  const handleSelect = (playerName: string | null) => {
    onAssign(playerName)
    setAnchorEl(null)
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={loading}
        startIcon={<Icon />}
        color={name ? "success" : "warning"}
        sx={{ flex: 1, justifyContent: "flex-start" }}
      >
        <Stack alignItems="flex-start">
          <Typography variant="caption">{label}</Typography>
          <Typography variant="body2" fontWeight={name ? "bold" : "normal"}>
            {loading ? "Ladataan..." : name || "Valitse..."}
          </Typography>
        </Stack>
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {players.length === 0 && (
          <MenuItem disabled>
            <ListItemText>Ei pelaajia. Lisää ensin.</ListItemText>
          </MenuItem>
        )}
        {name && (
          <MenuItem onClick={() => handleSelect(null)}>
            <ListItemIcon>
              <ClearIcon color="error" />
            </ListItemIcon>
            <ListItemText>Poista valinta</ListItemText>
          </MenuItem>
        )}
        {name && <Divider />}
        {players.map((player) => (
          <MenuItem
            key={player.id}
            onClick={() => handleSelect(player.name)}
            selected={player.name === name}
          >
            {player.name === name && (
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
            )}
            <ListItemText inset={player.name !== name}>{player.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export function GameCard({ game: initialGame }: { game: Game }) {
  const [game, setGame] = useState(initialGame)
  const allAssigned = game.officials.poytakirja && game.officials.kello

  const handleAssign = async (role: "poytakirja" | "kello", playerName: string | null) => {
    setGame({ ...game, officials: { ...game.officials, [role]: playerName } })
    await assignOfficial(game.id, role, playerName)
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack>
            <Stack direction="row" gap={1} mb={1}>
              <Chip label={game.divisionId} size="small" color="primary" variant="outlined" />
              <Chip
                label={allAssigned ? "Toimitsijat nimetty" : "Toimitsijat nimemättä"}
                size="small"
                color={allAssigned ? "success" : "error"}
                icon={allAssigned ? <CheckCircleIcon /> : undefined}
              />
            </Stack>
            <Typography variant="h6" fontWeight="bold">
              vs. {game.opponent}
            </Typography>
          </Stack>
          <Stack alignItems="flex-end">
            <Typography variant="h6" color="primary" fontWeight="bold">
              {game.time}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(game.date)}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" gap={0.5} mb={2} color="text.secondary">
          <LocationOnIcon fontSize="small" />
          <Typography variant="body2">{game.location}</Typography>
        </Stack>

        <Stack direction="row" gap={1}>
          <OfficialButton
            role="poytakirja"
            name={game.officials.poytakirja}
            onAssign={(name) => handleAssign("poytakirja", name)}
          />
          <OfficialButton
            role="kello"
            name={game.officials.kello}
            onAssign={(name) => handleAssign("kello", name)}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
