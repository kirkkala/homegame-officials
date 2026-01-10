"use client"

import { useState, useCallback, useEffect } from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import TextField from "@mui/material/TextField"
import Chip from "@mui/material/Chip"
import Alert from "@mui/material/Alert"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import Checkbox from "@mui/material/Checkbox"
import DeleteIcon from "@mui/icons-material/Delete"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import GroupIcon from "@mui/icons-material/Group"
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball"
import CloseIcon from "@mui/icons-material/Close"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { parseExcelFile, type ParsedGame } from "@/lib/excel-parser"
import {
  saveGames,
  clearAllGames,
  getGames,
  getPlayers,
  savePlayer,
  deletePlayer,
  updateGameHomeStatus,
  type Player,
  type Game,
} from "@/lib/storage"

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

function GamesTable({
  games,
  onToggleHomeGame,
}: {
  games: GameRow[]
  onToggleHomeGame: (key: string, isHomeGame: boolean) => void
}) {
  const showDivision = games.some((g) => g.division)

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">Kotipeli</TableCell>
            {showDivision && <TableCell>Sarja</TableCell>}
            <TableCell>Ottelu</TableCell>
            <TableCell>Aika</TableCell>
            <TableCell>Paikka</TableCell>
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
              {showDivision && <TableCell>{game.division}</TableCell>}
              <TableCell>
                <Typography variant="body2">
                  {game.homeTeam} — {game.awayTeam}
                </Typography>
              </TableCell>
              <TableCell>
                {game.date} {game.time}
              </TableCell>
              <TableCell>{game.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default function HallintaPage() {
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([])
  const [existingGames, setExistingGames] = useState<Game[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerNames, setPlayerNames] = useState("")

  const loadGames = useCallback(async () => {
    const games = await getGames()
    setExistingGames(games)
  }, [])

  useEffect(() => {
    Promise.all([getGames(), getPlayers()]).then(([games, loadedPlayers]) => {
      setExistingGames(games)
      setPlayers(loadedPlayers)
    })
  }, [])

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
    const saved = await saveGames(
      parsedGames.map((g) => ({
        divisionId: g.division,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        isHomeGame: g.isHomeGame,
        date: g.date,
        time: g.time,
        location: g.location,
      }))
    )
    const skipped = parsedGames.length - saved.length
    const homeGamesCount = saved.filter((g) => g.isHomeGame).length
    setImportStatus({
      type: "success",
      message: `Tuotu ${saved.length} peliä (${homeGamesCount} kotipeliä)!${skipped > 0 ? ` (${skipped} duplikaattia ohitettu)` : ""}`,
    })
    setParsedGames([])
    await loadGames()
  }, [parsedGames, loadGames])

  const handleClearAll = useCallback(async () => {
    if (confirm("Haluatko varmasti poistaa kaikki pelit?")) {
      await clearAllGames()
      setExistingGames([])
      setImportStatus({ type: "info", message: "Kaikki pelit poistettu" })
    }
  }, [])

  const handleToggleExistingHomeGame = useCallback(async (gameId: string, isHomeGame: boolean) => {
    const updated = await updateGameHomeStatus(gameId, isHomeGame)
    setExistingGames((prev) => prev.map((g) => (g.id === gameId ? updated : g)))
  }, [])

  const handleAddPlayers = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
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
        newPlayers.push(await savePlayer(name))
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
    [playerNames, players]
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header title="Hallinta" subtitle="Pelaajat ja pelien tuonti" backHref="/" />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack gap={3}>
          {importStatus && (
            <Alert severity={importStatus.type} onClose={() => setImportStatus(null)}>
              {importStatus.message}
            </Alert>
          )}

          {/* Players */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <GroupIcon color="primary" />
                <Typography variant="h6">Pelaajat</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Joukkueen pelaajat, kenelle osoitetaan toimisijavuorovastuu.
              </Typography>

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

              {players.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
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
            </CardContent>
          </Card>

          {/* Games Upload */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <SportsBasketballIcon color="primary" />
                  <Typography variant="h6">Tuo pelejä</Typography>
                </Stack>
              </Stack>

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
            </CardContent>
          </Card>

          {/* Preview - New games to import */}
          {parsedGames.length > 0 && (
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack>
                    <Typography variant="h6">Esikatselu: {parsedGames.length} peliä</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Merkitse kotipelit, jotka vaativat toimitsijat
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
                    date: g.date,
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
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <SportsBasketballIcon color="primary" />
                    <Typography variant="h6">Kaikki pelit ({existingGames.length})</Typography>
                  </Stack>
                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearAll}
                  >
                    Tyhjennä kaikki
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Merkitse kotipelit rastilla. Kotipeleissä tarvitaan toimitsijat.
                </Typography>

                <GamesTable
                  games={existingGames.map((g) => ({
                    key: g.id,
                    division: g.divisionId,
                    homeTeam: g.homeTeam,
                    awayTeam: g.awayTeam,
                    date: g.date,
                    time: g.time,
                    location: g.location,
                    isHomeGame: g.isHomeGame,
                  }))}
                  onToggleHomeGame={(key, isHomeGame) =>
                    handleToggleExistingHomeGame(key, isHomeGame)
                  }
                />
              </CardContent>
            </Card>
          )}
        </Stack>
        <Footer />
      </Container>
    </Box>
  )
}
