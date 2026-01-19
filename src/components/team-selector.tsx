"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { Add as AddIcon } from "@mui/icons-material"
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
  const { data: session } = useSession()
  const user = session?.user
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

  const createMutation = useMutation({
    mutationFn: (name: string) => createTeam(name),
    onSuccess: () => {
      setNewTeamName("")
      setDialogOpen(false)
    },
  })

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    if (value === "__create__") {
      setDialogOpen(true)
    } else {
      selectTeam(value)
    }
  }

  const handleCloseDialog = () => {
    if (createMutation.isPending) return
    setDialogOpen(false)
    setNewTeamName("")
    createMutation.reset()
  }

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      createMutation.mutate(newTeamName.trim())
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      {teams.length === 0 ? (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          size={size}
          disabled={!user}
        >
          Luo joukkue
        </Button>
      ) : (
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
              {showCreateButton && user && (
                <MenuItem value="__create__">+ Luo uusi joukkue...</MenuItem>
              )}
            </Select>
          </FormControl>
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Luo uusi joukkue</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {createMutation.error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Joukkueen luonti epäonnistui"}
              </Alert>
            )}
            <TextField
              autoFocus
              fullWidth
              label="Joukkueen nimi"
              placeholder="esim. HNMKY T14 Stadi"
              value={newTeamName}
              onChange={(e) => {
                setNewTeamName(e.target.value)
                createMutation.reset()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCreateTeam()
                }
              }}
              error={!!createMutation.error}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Joukkueenjohtaja luo joukkueen ja lisää pelaajat sekä ottelut hallintasivulta.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={createMutation.isPending}>
            Peruuta
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTeam}
            disabled={!newTeamName.trim() || createMutation.isPending}
            startIcon={
              createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {createMutation.isPending ? "Luodaan..." : "Luo joukkue"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
