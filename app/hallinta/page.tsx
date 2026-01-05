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
  type Player,
} from "@/lib/storage"
import { formatDate } from "@/lib/utils"

export default function HallintaPage() {
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)
  const [existingGamesCount, setExistingGamesCount] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerNames, setPlayerNames] = useState("")

  useEffect(() => {
    Promise.all([getGames(), getPlayers()]).then(([games, loadedPlayers]) => {
      setExistingGamesCount(games.length)
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

  const handleImport = useCallback(async () => {
    const saved = await saveGames(
      parsedGames.map((g) => ({
        divisionId: g.division,
        opponent: g.opponent,
        date: g.date,
        time: g.time,
        location: g.location,
      }))
    )
    const skipped = parsedGames.length - saved.length
    setImportStatus({
      type: "success",
      message: `Tuotu ${saved.length} kotipeliä!${skipped > 0 ? ` (${skipped} duplikaattia ohitettu)` : ""}`,
    })
    setParsedGames([])
    setExistingGamesCount((await getGames()).length)
  }, [parsedGames])

  const handleClearAll = useCallback(async () => {
    if (confirm("Haluatko varmasti poistaa kaikki pelit?")) {
      await clearAllGames()
      setExistingGamesCount(0)
      setImportStatus({ type: "info", message: "Kaikki pelit poistettu" })
    }
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
      const newPlayers = await Promise.all(newNames.map(savePlayer))

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
                  fullWidth
                  multiline
                  rows={3}
                  value={playerNames}
                  onChange={(e) => setPlayerNames(e.target.value)}
                  placeholder="Lisää pelaajia (yksi per rivi)"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" size="small">
                  Lisää pelaajat
                </Button>
              </form>

              {players.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
                  {players.map((player) => (
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

          {/* Games */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <SportsBasketballIcon color="primary" />
                  <Typography variant="h6">Pelit</Typography>
                </Stack>
                {existingGamesCount > 0 && (
                  <Button
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearAll}
                  >
                    Tyhjennä ({existingGamesCount})
                  </Button>
                )}
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
                  p: 4,
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

          {/* Preview */}
          {parsedGames.length > 0 && (
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Esikatselu: {parsedGames.length} kotipeliä</Typography>
                  <Button variant="contained" color="success" onClick={handleImport}>
                    Tuo pelit
                  </Button>
                </Stack>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Divisioona</TableCell>
                        <TableCell>Vastustaja</TableCell>
                        <TableCell>Päivämäärä</TableCell>
                        <TableCell>Aika</TableCell>
                        <TableCell>Paikka</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedGames.map((game, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={game.division}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{game.opponent}</TableCell>
                          <TableCell>{formatDate(game.date)}</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "primary.main" }}>
                            {game.time}
                          </TableCell>
                          <TableCell>{game.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Stack>
        <Footer />
      </Container>
    </Box>
  )
}
