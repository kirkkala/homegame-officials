"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  CircularProgress,
} from "@mui/material"
import {
  Remove as MinusIcon,
  DeleteForever as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  UploadFile as UploadFileIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TeamSelector } from "@/components/team-selector"
import { useTeam } from "@/components/team-context"
import { parseExcelFile, type ParsedGame } from "@/lib/excel-parser"
import {
  saveGames,
  clearAllGames,
  getGames,
  getPlayers,
  savePlayer,
  deletePlayer,
  updateGameHomeStatus,
  deleteGame,
  type Player,
  type Game,
} from "@/lib/storage"
import { formatDate } from "@/lib/utils"

type GameRow = {
  key: string
  division: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  location: string
  isHomeGame: boolean
}

const INITIAL_MANUAL_GAME = {
  division: "",
  homeTeam: "",
  awayTeam: "",
  date: "",
  time: "",
  location: "",
  isHomeGame: true,
}

const PageLayout = ({ subtitle, children }: { subtitle: string; children: React.ReactNode }) => (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
    <Header title="Hallinta" subtitle={subtitle} backHref="/" />
    <Container maxWidth="md" sx={{ py: 4 }}>
      {children}
    </Container>
  </Box>
)

function GamesTable({
  games,
  onToggleHomeGame,
  onDelete,
}: {
  games: GameRow[]
  onToggleHomeGame: (key: string, isHomeGame: boolean) => void
  onDelete?: (key: string) => void
}) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">Koti</TableCell>
            <TableCell>Sarja</TableCell>
            <TableCell>Ottelu</TableCell>
            <TableCell>Aika</TableCell>
            <TableCell>Paikka</TableCell>
            {onDelete && <TableCell padding="checkbox" />}
          </TableRow>
        </TableHead>
        <TableBody>
          {games.map((game) => (
            <TableRow
              key={game.key}
              hover
              onClick={() => onToggleHomeGame(game.key, !game.isHomeGame)}
              selected={game.isHomeGame}
              sx={{
                cursor: "pointer",
                "&.Mui-selected": {
                  bgcolor: "success.50",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "success.100",
                },
                transition: "background-color 0.15s ease-in-out",
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={game.isHomeGame}
                  color="success"
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => onToggleHomeGame(game.key, !game.isHomeGame)}
                />
              </TableCell>
              <TableCell sx={{ textWrap: "nowrap", textAlign: "right" }}>{game.division}</TableCell>
              <TableCell>
                <Typography variant="body2">
                  {game.homeTeam} — {game.awayTeam}
                </Typography>
              </TableCell>
              <TableCell>
                {game.date} {game.time}
              </TableCell>
              <TableCell>{game.location}</TableCell>
              {onDelete && (
                <TableCell padding="checkbox">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(game.key)
                    }}
                    sx={{ opacity: 0.5, "&:hover": { opacity: 1, color: "error.main" } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default function HallintaPage() {
  const { selectedTeam, isLoading: teamLoading, deleteTeam } = useTeam()
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([])
  const [existingGames, setExistingGames] = useState<Game[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerNames, setPlayerNames] = useState("")
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualGame, setManualGame] = useState(INITIAL_MANUAL_GAME)
  const [importExpanded, setImportExpanded] = useState(false)
  const [playersExpanded, setPlayersExpanded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!selectedTeam) {
        setExistingGames([])
        setPlayers([])
        return
      }

      const [games, loadedPlayers] = await Promise.all([
        getGames(selectedTeam.id),
        getPlayers(selectedTeam.id),
      ])
      setExistingGames(games)
      setPlayers(loadedPlayers)
      setImportExpanded(games.length === 0)
      setPlayersExpanded(loadedPlayers.length === 0)
    }

    loadData()
  }, [selectedTeam])

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setImportStatus({ type: "error", message: "Valitse Excel-tiedosto (.xlsx tai .xls)" })
      return
    }
    const arrayBuffer = await file.arrayBuffer()
    setParsedGames(parseExcelFile(arrayBuffer))
    setImportStatus(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
    },
    [handleFile]
  )

  const handleToggleHomeGame = useCallback((index: number) => {
    setParsedGames((prev) =>
      prev.map((g, i) => (i === index ? { ...g, isHomeGame: !g.isHomeGame } : g))
    )
  }, [])

  const handleImport = useCallback(async () => {
    if (!selectedTeam) return
    const saved = await saveGames(
      parsedGames.map((g) => ({
        divisionId: g.division,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        isHomeGame: g.isHomeGame,
        date: g.date,
        time: g.time,
        location: g.location,
      })),
      selectedTeam.id
    )
    const skipped = parsedGames.length - saved.length
    const homeGamesCount = saved.filter((g) => g.isHomeGame).length
    setImportStatus({
      type: "success",
      message: `Tuotu ${saved.length} peliä (${homeGamesCount} kotipeliä)!${skipped > 0 ? ` (${skipped} duplikaattia ohitettu)` : ""}`,
    })
    setParsedGames([])
    setExistingGames(await getGames(selectedTeam.id))
  }, [parsedGames, selectedTeam])

  const handleClearAll = useCallback(async () => {
    if (!selectedTeam) return
    if (confirm("Haluatko varmasti poistaa kaikki pelit?")) {
      await clearAllGames(selectedTeam.id)
      setExistingGames([])
      setImportStatus({ type: "info", message: "Kaikki pelit poistettu" })
    }
  }, [selectedTeam])

  const handleToggleExistingHomeGame = useCallback(async (gameId: string, isHomeGame: boolean) => {
    const updated = await updateGameHomeStatus(gameId, isHomeGame)
    setExistingGames((prev) => prev.map((g) => (g.id === gameId ? updated : g)))
  }, [])

  const handleDeleteGame = useCallback(
    async (gameId: string) => {
      const game = existingGames.find((g) => g.id === gameId)
      if (!game || !confirm(`Poistetaanko ${game.homeTeam} vs ${game.awayTeam}?`)) return
      await deleteGame(gameId)
      setExistingGames((prev) => prev.filter((g) => g.id !== gameId))
    },
    [existingGames]
  )

  const handleAddPlayers = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedTeam) return
      const names = playerNames
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean)
      if (names.length === 0) return

      const existingNames = new Set(players.map((p) => p.name.toLowerCase()))
      const newNames = names.filter((n) => !existingNames.has(n.toLowerCase()))

      // Save players sequentially to avoid race condition in file-based DB
      const newPlayers = []
      for (const name of newNames) {
        newPlayers.push(await savePlayer(name, selectedTeam.id))
      }

      setPlayers([...players, ...newPlayers])
      setPlayerNames("")
      if (newPlayers.length > 0) {
        const skipped = names.length - newPlayers.length
        setImportStatus({
          type: "success",
          message: `Lisätty ${newPlayers.length} pelaajaa${skipped > 0 ? ` (${skipped} duplikaattia ohitettu)` : ""}`,
        })
      }
    },
    [playerNames, players, selectedTeam]
  )

  const handleDeletePlayer = useCallback(
    async (id: string) => {
      const player = players.find((p) => p.id === id)
      if (!player || !confirm(`Haluatko varmasti poistaa pelaajan ${player.name}?`)) return
      await deletePlayer(id)
      setPlayers(players.filter((p) => p.id !== id))
    },
    [players]
  )

  const updateManualGame = (field: keyof typeof INITIAL_MANUAL_GAME, value: string | boolean) =>
    setManualGame((prev) => ({ ...prev, [field]: value }))

  const handleAddManualGame = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (
        !selectedTeam ||
        !manualGame.homeTeam ||
        !manualGame.awayTeam ||
        !manualGame.date ||
        !manualGame.time
      )
        return
      const saved = await saveGames(
        [
          {
            divisionId: manualGame.division,
            homeTeam: manualGame.homeTeam,
            awayTeam: manualGame.awayTeam,
            date: manualGame.date,
            time: manualGame.time,
            location: manualGame.location,
            isHomeGame: manualGame.isHomeGame,
          },
        ],
        selectedTeam.id
      )
      if (saved.length > 0) {
        setImportStatus({ type: "success", message: "Peli lisätty!" })
        setManualGame(INITIAL_MANUAL_GAME)
        setShowManualForm(false)
        setExistingGames(await getGames(selectedTeam.id))
      }
    },
    [manualGame, selectedTeam]
  )

  const handleDeleteTeam = useCallback(async () => {
    if (!selectedTeam) return
    if (
      confirm(
        `Haluatko varmasti poistaa joukkueen "${selectedTeam.name}"? Tämä poistaa myös kaikki joukkueen pelit ja pelaajat.`
      )
    ) {
      await deleteTeam(selectedTeam.id)
      setImportStatus({ type: "info", message: "Joukkue poistettu" })
    }
  }, [selectedTeam, deleteTeam])

  if (teamLoading) {
    return (
      <PageLayout subtitle="Pelaajat ja pelien tuonti">
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      </PageLayout>
    )
  }

  if (!selectedTeam) {
    return (
      <PageLayout subtitle="Pelaajat ja pelien tuonti">
        <Stack alignItems="center" py={8}>
          <GroupsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Valitse tai luo joukkue
          </Typography>
          <Typography color="text.secondary" mb={3} textAlign="center">
            Joukkueenjohtaja luo joukkueen ja lisää pelaajat sekä kotipelit.
          </Typography>
          <TeamSelector showCreateButton />
        </Stack>
        <Footer />
      </PageLayout>
    )
  }

  return (
    <PageLayout subtitle={selectedTeam.name}>
      <Stack gap={3}>
        {importStatus && (
          <Alert severity={importStatus.type} onClose={() => setImportStatus(null)}>
            {importStatus.message}
          </Alert>
        )}

        {/* Team Management */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2">Joukkue</Typography>
            <Button
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteTeam}
            >
              Poista joukkue
            </Button>
          </Stack>
          <Stack direction="row" alignItems="center" gap={2}>
            <TeamSelector showCreateButton />
          </Stack>
        </Box>

        <Box>
          <Accordion
            expanded={playersExpanded}
            onChange={(_, isExpanded) => setPlayersExpanded(isExpanded)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography component="h2" sx={{ fontSize: "1.25rem" }}>
                Joukkueen pelaajat ({players.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Joukkueen pelaajat toimitsijavuorovastuun valintalistaan.</Typography>
              {players.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={1} my={2}>
                  {[...players]
                    .sort((a, b) => a.name.localeCompare(b.name, "fi"))
                    .map((player) => (
                      <Chip
                        key={player.id}
                        label={player.name}
                        onDelete={() => handleDeletePlayer(player.id)}
                        deleteIcon={<CloseIcon />}
                      />
                    ))}
                </Stack>
              )}
              <form onSubmit={handleAddPlayers}>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  value={playerNames}
                  onChange={(e) => setPlayerNames(e.target.value)}
                  placeholder="Lisää pelaajia (yksi per rivi)"
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" size="small">
                  Lisää pelaajat
                </Button>
              </form>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={importExpanded}
            onChange={(_, isExpanded) => setImportExpanded(isExpanded)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography component="h2" sx={{ fontSize: "1.25rem" }}>
                Tuo otteluita
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                sx={{
                  border: 2,
                  borderStyle: "dashed",
                  borderColor: isDragging ? "primary.main" : "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  bgcolor: isDragging ? "primary.50" : "transparent",
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  Vedä Excel-tiedosto tähän tai
                </Typography>
                <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                  Valitse tiedosto
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={showManualForm ? <MinusIcon /> : <AddIcon />}
                  onClick={() => setShowManualForm(!showManualForm)}
                  variant="outlined"
                >
                  {showManualForm ? "Piilota lomake" : "Lisää manuaalisesti"}
                </Button>
              </Box>
              {/* Manual game form */}
              {showManualForm && (
                <Box
                  component="form"
                  onSubmit={handleAddManualGame}
                  sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Lisää peli manuaalisesti
                  </Typography>
                  <Stack gap={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                      <TextField
                        label="Koti"
                        size="small"
                        required
                        value={manualGame.homeTeam}
                        onChange={(e) => updateManualGame("homeTeam", e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Vieras"
                        size="small"
                        required
                        value={manualGame.awayTeam}
                        onChange={(e) => updateManualGame("awayTeam", e.target.value)}
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                      <TextField
                        label="Päivämäärä"
                        type="date"
                        size="small"
                        required
                        value={manualGame.date}
                        onChange={(e) => updateManualGame("date", e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Aika"
                        type="time"
                        size="small"
                        required
                        value={manualGame.time}
                        onChange={(e) => updateManualGame("time", e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ flex: 1 }}
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                      <TextField
                        label="Sarja"
                        size="small"
                        placeholder="esim. I div."
                        value={manualGame.division}
                        onChange={(e) => updateManualGame("division", e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Paikka"
                        size="small"
                        value={manualGame.location}
                        onChange={(e) => updateManualGame("location", e.target.value)}
                        sx={{ flex: 2 }}
                      />
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Checkbox
                          checked={manualGame.isHomeGame}
                          color="success"
                          onChange={(e) => updateManualGame("isHomeGame", e.target.checked)}
                        />
                        <Typography variant="body2">Kotipeli (tarvitsee toimitsijat)</Typography>
                      </Stack>
                      <Button type="submit" variant="contained" size="small">
                        Lisää peli
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
        {/* Preview - New games to import */}
        {parsedGames.length > 0 && (
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack>
                  <Typography variant="h6">Esikatselu: {parsedGames.length} peliä</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Merkitse kotipelit, jotka vaativat toimitsijat ja paina &quot;Tuo pelit&quot;.
                  </Typography>
                </Stack>
                <Button variant="contained" color="success" onClick={handleImport}>
                  Tuo pelit
                </Button>
              </Stack>

              <GamesTable
                games={parsedGames.map((g, i) => ({
                  key: String(i),
                  division: g.division,
                  homeTeam: g.homeTeam,
                  awayTeam: g.awayTeam,
                  date: formatDate(g.date),
                  time: g.time,
                  location: g.location,
                  isHomeGame: g.isHomeGame,
                }))}
                onToggleHomeGame={(key) => handleToggleHomeGame(Number(key))}
              />
            </CardContent>
          </Card>
        )}

        {/* Existing Games */}
        {existingGames.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6">Ottelut ({existingGames.length})</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Merkitse kotipelit rastilla jotta niihin voi lisätä toimitsijoita. Järjestelmä
                tallentaa valinnan automaattisesti.
              </Typography>

              <GamesTable
                games={[...existingGames]
                  .sort((a, b) => {
                    const dateCompare = a.date.localeCompare(b.date)
                    if (dateCompare !== 0) return dateCompare
                    return a.time.localeCompare(b.time)
                  })
                  .map((g) => ({
                    key: g.id,
                    division: g.divisionId,
                    homeTeam: g.homeTeam,
                    awayTeam: g.awayTeam,
                    date: formatDate(g.date),
                    time: g.time,
                    location: g.location,
                    isHomeGame: g.isHomeGame,
                  }))}
                onToggleHomeGame={handleToggleExistingHomeGame}
                onDelete={handleDeleteGame}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearAll}
                >
                  Poista kaikki pelit
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
      <Footer />
    </PageLayout>
  )
}
