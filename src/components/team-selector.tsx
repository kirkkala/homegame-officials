"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material"
import { Add } from "@mui/icons-material"
import { useTeam } from "./team-context"

type TeamSelectorProps = {
  showCreateButton?: boolean
  size?: "small" | "medium"
  fullWidth?: boolean
  variant?: "standard" | "outlined" | "filled"
}

export function TeamSelector({
  showCreateButton = false,
  size = "small",
  fullWidth = false,
  variant = "outlined",
}: TeamSelectorProps) {
  const { teams, selectedTeam, selectTeam, createTeam, isLoading } = useTeam()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    if (value === "__create__") {
      setDialogOpen(true)
    } else {
      selectTeam(value)
    }
  }

  const handleCreateTeam = async () => {
    if (newTeamName.trim()) {
      await createTeam(newTeamName.trim())
      setNewTeamName("")
      setDialogOpen(false)
    }
  }

  if (isLoading) {
    return null
  }

  if (teams.length === 0) {
    return (
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setDialogOpen(true)}
        size={size}
      >
        Luo joukkue
      </Button>
    )
  }

  return (
    <>
      <Stack direction="row" alignItems="center" gap={1}>
        <FormControl size={size} fullWidth={fullWidth} variant={variant} sx={{ minWidth: 180 }}>
          <InputLabel id="team-select-label">Joukkue</InputLabel>
          <Select
            labelId="team-select-label"
            value={selectedTeam?.id ?? ""}
            label="Joukkue"
            onChange={handleChange}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
            {showCreateButton && <MenuItem value="__create__">+ Luo uusi joukkue...</MenuItem>}
          </Select>
        </FormControl>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Luo uusi joukkue</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Joukkueen nimi"
              placeholder="esim. HNMKY T14 Stadi"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCreateTeam()
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Joukkueenjohtaja luo joukkueen ja lisää pelaajat sekä pelit hallintasivulta.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Peruuta</Button>
          <Button variant="contained" onClick={handleCreateTeam} disabled={!newTeamName.trim()}>
            Luo joukkue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
