"use client"

import {
  Clear as ClearIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Footer } from "@/components/footer"
import { MainHeader } from "@/components/header"
import { useTeam } from "@/components/team-context"
import { useFirstAidBags } from "@/hooks/use-first-aid-bags"
import {
  type BagHolder,
  clearBagHolder,
  getBagCountForTeam,
  setBagHolder,
} from "@/lib/first-aid-bags"
import { formatDate } from "@/lib/utils"

function BagCard({
  bagNumber,
  holder,
  teamId,
  team,
  onUpdate,
}: {
  bagNumber: number
  holder: BagHolder | null
  teamId: string
  team?: { firstAidBagCount?: string } | null
  onUpdate: () => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [clearError, setClearError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dialogOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [dialogOpen])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setName("")
    setError(null)
    setClearError(null)
  }, [])

  const handleClear = useCallback(async () => {
    setClearError(null)
    try {
      await clearBagHolder(teamId, bagNumber, team)
      onUpdate()
    } catch (e) {
      setClearError(e instanceof Error ? e.message : "Tyhjennys epäonnistui")
    }
  }, [teamId, bagNumber, team, onUpdate])

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Syötä nimesi")
      return
    }
    try {
      await setBagHolder(teamId, bagNumber, trimmed, team)
      closeDialog()
      onUpdate()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tallennus epäonnistui")
    }
  }, [name, teamId, bagNumber, team, onUpdate, closeDialog])

  return (
    <Card
      variant="outlined"
      sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
      data-testid={`bag-card-${bagNumber}`}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" component="h3" fontWeight="bold">
          Laukku #{bagNumber}
        </Typography>

        <Box sx={{ mt: 1, minHeight: 72 }}>
          {holder ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Päivitetty {formatDate(holder.lastSeenAt)}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={0.5}
                sx={{ mt: 0.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                  <PersonIcon sx={{ fontSize: 22, color: "primary.main", flexShrink: 0 }} />
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {holder.name}
                  </Typography>
                </Stack>
                <IconButton size="small" aria-label="Tyhjennä" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Stack>
              {clearError && (
                <Typography variant="caption" color="error">
                  {clearError}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Oivoi, ei nimeä! Toivottavasti laukku on tallessa! 🥺
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => {
            setName("")
            setError(null)
            setClearError(null)
            setDialogOpen(true)
          }}
          fullWidth
        >
          {holder ? "Vaihda haltija" : "Ota laukku haltuun"}
        </Button>

        <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <DialogTitle>Ota haltuun laukku #{bagNumber}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Onko laukku sinulla? Anna nimesi ja tallenna.
              </Typography>
              <TextField
                inputRef={inputRef}
                label="Nimi"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                error={!!error}
                helperText={error}
                fullWidth
                autoComplete="off"
                slotProps={{
                  htmlInput: { "data-1p-ignore": true, "data-testid": "claim-bag-name" },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button type="button" onClick={closeDialog} data-testid="claim-bag-cancel">
                Peruuta
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!name.trim()}
                data-testid="claim-bag-submit"
              >
                Tallenna
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default function EnsiapulaukutPage() {
  const { selectedTeam, isLoading } = useTeam()
  const { bags, refresh } = useFirstAidBags(selectedTeam?.id ?? null, selectedTeam ?? undefined)

  const bagCount = selectedTeam ? getBagCountForTeam(selectedTeam) : 0

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MainHeader />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 }, flex: 1 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : !selectedTeam ? (
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MedicalServicesIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Ensiapulaukut
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Valitse joukkue nähdäksesi ensiapulaukut.
            </Typography>
          </Paper>
        ) : !selectedTeam?.firstAidBagsEnabled ? (
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MedicalServicesIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Ensiapulaukut
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Ensiapulaukkujen seuranta ei ole käytössä tälle joukkueelle. Ota se käyttöön{" "}
              <Link href="/hallinta" style={{ fontWeight: 600 }}>
                hallinnassa
              </Link>
              .
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MedicalServicesIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h2" fontWeight="bold">
                {selectedTeam.name} ensiapulaukkujen haltijat
              </Typography>
            </Stack>
            <Grid container spacing={2} alignItems="stretch">
              {Array.from({ length: bagCount }, (_, i) => i + 1).map((bagNum) => (
                <Grid
                  key={bagNum}
                  size={{ xs: 12, sm: 6, md: 4 }}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <BagCard
                    bagNumber={bagNum}
                    holder={bags[`bag${bagNum}`] ?? null}
                    teamId={selectedTeam.id}
                    team={selectedTeam}
                    onUpdate={refresh}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>
      <Footer />
    </Box>
  )
}
