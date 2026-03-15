"use client"

import { Add as AddIcon } from "@mui/icons-material"
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
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { alpha } from "@mui/material/styles"
import { useMutation } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useTeam } from "./team-context"

type TeamSelectorProps = {
  showCreateButton?: boolean
  size?: "small" | "medium"
  fullWidth?: boolean
  variant?: "standard" | "outlined" | "filled"
  compact?: boolean
}

export function TeamSelector({
  showCreateButton = false,
  size = "small",
  fullWidth = false,
  variant = "outlined",
  compact = false,
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
    } else if (value === "") {
      selectTeam(null)
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
          data-testid="team-create-button"
        >
          Luo joukkue
        </Button>
      ) : (
        <Stack direction="row" alignItems="center" gap={1}>
          <FormControl
            size={size}
            fullWidth={fullWidth}
            variant={variant}
            sx={(theme) => ({
              minWidth: compact ? 160 : 200,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              borderRadius: 1,
            })}
          >
            <InputLabel id="team-select-label" shrink>
              Joukkue
            </InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeam?.id ?? ""}
              label="Joukkue"
              onChange={handleChange}
              data-testid="team-select"
              displayEmpty
              renderValue={(value) => {
                if (!value) return "Valitse joukkue"
                return teams.find((team) => team.id === value)?.name ?? "Valitse joukkue"
              }}
            >
              <MenuItem value="" data-testid="team-option-empty">
                Valitse joukkue
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id} data-testid={`team-option-${team.id}`}>
                  {team.name}
                </MenuItem>
              ))}
              {showCreateButton && user && (
                <MenuItem value="__create__" data-testid="team-option-create">
                  + Luo uusi joukkue...
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Stack>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        data-testid="team-create-dialog"
      >
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
              inputProps={{ "data-testid": "team-create-input" }}
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
            data-testid="team-create-submit"
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
