"use client"

import { useState, useCallback, useRef, type InputHTMLAttributes } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material"
import {
  Add as AddIcon,
  Close as CloseIcon,
  DeleteForever as DeleteForeverIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  Groups as GroupsIcon,
  HelpOutline as HelpOutlineIcon,
  Remove as RemoveIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material"
import NextLink from "next/link"
import { AuthActionButton } from "@/components/auth-action-button"
import { MainHeader } from "@/components/header"
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
  updateGameDetails,
  deleteGame,
  getTeamManagers,
  addTeamManager,
  removeTeamManager,
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

const PageLayout = ({ children }: { subtitle: string; children: React.ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <MainHeader />
    <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
      {children}
    </Container>
    <Footer />
  </Box>
)

function GamesTable({
  games,
  onToggleHomeGame,
  onEdit,
  onDelete,
  testIdPrefix,
}: {
  games: GameRow[]
  onToggleHomeGame: (key: string, isHomeGame: boolean) => void
  onEdit?: (key: string) => void
  onDelete?: (key: string) => void
  testIdPrefix?: string
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
            {onEdit && <TableCell padding="checkbox" />}
            {onDelete && <TableCell padding="checkbox" />}
          </TableRow>
        </TableHead>
        <TableBody>
          {games.map((game) => (
            <TableRow
              key={game.key}
              hover
              data-testid={testIdPrefix ? `${testIdPrefix}-row-${game.key}` : undefined}
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
                  slotProps={{
                    input: {
                      "data-testid": testIdPrefix
                        ? `${testIdPrefix}-home-toggle-${game.key}`
                        : undefined,
                    } as InputHTMLAttributes<HTMLInputElement>,
                  }}
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
              {onEdit && (
                <TableCell padding="checkbox" sx={{ p: 0 }}>
                  <IconButton
                    data-testid={testIdPrefix ? `${testIdPrefix}-edit-${game.key}` : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(game.key)
                    }}
                    sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              )}
              {onDelete && (
                <TableCell padding="checkbox">
                  <IconButton
                    data-testid={testIdPrefix ? `${testIdPrefix}-delete-${game.key}` : undefined}
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
  const queryClient = useQueryClient()
  const { selectedTeam, isLoading: teamLoading, deleteTeam } = useTeam()
  const { data: session, status } = useSession()
  const user = session?.user
  const authLoading = status === "loading"
  const userEmail = user?.email ?? ""
  const isAdmin = !!user?.isAdmin
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null)
  const [playerNames, setPlayerNames] = useState("")
  const [managerEmail, setManagerEmail] = useState("")
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualGame, setManualGame] = useState(INITIAL_MANUAL_GAME)
  const [importExpanded, setImportExpanded] = useState(false)
  const [playersExpanded, setPlayersExpanded] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title?: string
    message: string
    onConfirm: () => void
  }>({ open: false, message: "", onConfirm: () => {} })
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    gameId: string
    division: string
    homeTeam: string
    awayTeam: string
    date: string
    time: string
    location: string
    dateLabel: string
  }>({
    open: false,
    gameId: "",
    division: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    location: "",
    dateLabel: "",
  })

  const renderEditField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    testId: string,
    options?: { type?: "text" | "time" | "date"; flex?: number }
  ) => (
    <TextField
      label={label}
      type={options?.type}
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        inputLabel:
          options?.type === "time" || options?.type === "date" ? { shrink: true } : undefined,
        htmlInput: { "data-testid": testId },
      }}
      sx={{ flex: options?.flex ?? 1 }}
    />
  )

  // Queries
  const { data: existingGames = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["games", selectedTeam?.id],
    queryFn: () => getGames(selectedTeam!.id),
    enabled: !!selectedTeam,
  })

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["players", selectedTeam?.id],
    queryFn: () => getPlayers(selectedTeam!.id),
    enabled: !!selectedTeam,
  })

  const { data: managers = [], isLoading: managersLoading } = useQuery({
    queryKey: ["team-managers", selectedTeam?.id],
    queryFn: () => getTeamManagers(selectedTeam!.id),
    enabled: !!selectedTeam,
  })

  // Set accordion expansion based on data
  const shouldExpandImport = existingGames.length === 0 && !gamesLoading
  const shouldExpandPlayers = players.length === 0 && !playersLoading

  // Mutations
  const importMutation = useMutation({
    mutationFn: async () => {
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
        selectedTeam!.id
      )
      return { saved, total: parsedGames.length }
    },
    onSuccess: ({ saved, total }) => {
      const skipped = total - saved.length
      const homeGamesCount = saved.filter((g) => g.isHomeGame).length
      setSnackbar({
        type: "success",
        message: `Tuotu ${saved.length} ottelua, (${homeGamesCount} kotipeliä)!${skipped > 0 ? ` (${skipped} duplikaattia ohitettu)` : ""}`,
      })
      setParsedGames([])
      queryClient.invalidateQueries({ queryKey: ["games", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Otteluiden tuonti epäonnistui" })
    },
  })

  const clearGamesMutation = useMutation({
    mutationFn: () => clearAllGames(selectedTeam!.id),
    onSuccess: () => {
      setSnackbar({ type: "info", message: "Kaikki ottelut poistettu" })
      queryClient.invalidateQueries({ queryKey: ["games", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Otteluiden poisto epäonnistui" })
    },
  })

  const toggleHomeGameMutation = useMutation({
    mutationFn: ({ gameId, isHomeGame }: { gameId: string; isHomeGame: boolean }) =>
      updateGameHomeStatus(gameId, isHomeGame),
    onMutate: async ({ gameId, isHomeGame }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["games", selectedTeam?.id] })
      // Optimistically update
      queryClient.setQueryData(["games", selectedTeam?.id], (old: typeof existingGames) =>
        old?.map((g) => (g.id === gameId ? { ...g, isHomeGame } : g))
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["games", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Tallentaminen epäonnistui" })
    },
  })

  const updateGameDetailsMutation = useMutation({
    mutationFn: (updates: {
      gameId: string
      divisionId: string
      homeTeam: string
      awayTeam: string
      date: string
      time: string
      location: string
    }) =>
      updateGameDetails(updates.gameId, {
        divisionId: updates.divisionId,
        homeTeam: updates.homeTeam,
        awayTeam: updates.awayTeam,
        date: updates.date,
        time: updates.time,
        location: updates.location,
      }),
    onSuccess: () => {
      setSnackbar({ type: "success", message: "Ottelu päivitetty" })
      setEditDialog((prev) => ({ ...prev, open: false }))
      queryClient.invalidateQueries({ queryKey: ["games", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Ottelun päivitys epäonnistui" })
    },
  })

  const deleteGameMutation = useMutation({
    mutationFn: (gameId: string) => deleteGame(gameId),
    onSuccess: () => {
      setSnackbar({ type: "success", message: "Ottelu poistettu" })
      queryClient.invalidateQueries({ queryKey: ["games", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Ottelun poistaminen epäonnistui" })
    },
  })

  const addPlayersMutation = useMutation({
    mutationFn: async (names: string[]) => {
      const existingNames = new Set(players.map((p) => p.name.toLowerCase()))
      const newNames = names.filter((n) => !existingNames.has(n.toLowerCase()))
      const newPlayers = []
      for (const name of newNames) {
        newPlayers.push(await savePlayer(name, selectedTeam!.id))
      }
      return { added: newPlayers.length, skipped: names.length - newPlayers.length }
    },
    onSuccess: ({ added, skipped }) => {
      setPlayerNames("")
      if (added > 0) {
        setSnackbar({
          type: "success",
          message: `Lisätty ${added} pelaajaa${skipped > 0 ? ` (${skipped} duplikaattia ohitettu)` : ""}`,
        })
      }
      queryClient.invalidateQueries({ queryKey: ["players", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Pelaajien lisääminen epäonnistui" })
    },
  })

  const deletePlayerMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      setSnackbar({ type: "success", message: "Pelaaja poistettu" })
      queryClient.invalidateQueries({ queryKey: ["players", selectedTeam?.id] })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Pelaajan poistaminen epäonnistui" })
    },
  })

  const addManagerMutation = useMutation({
    mutationFn: (email: string) => addTeamManager(selectedTeam!.id, email),
    onSuccess: () => {
      setManagerEmail("")
      queryClient.invalidateQueries({ queryKey: ["team-managers", selectedTeam?.id] })
      setSnackbar({ type: "success", message: "Käyttäjä lisätty" })
    },
    onError: (error) => {
      setSnackbar({
        type: "error",
        message: error instanceof Error ? error.message : "Käyttäjän lisääminen epäonnistui",
      })
    },
  })

  const removeManagerMutation = useMutation({
    mutationFn: (email: string) => removeTeamManager(selectedTeam!.id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-managers", selectedTeam?.id] })
      setSnackbar({ type: "info", message: "Käyttäjä poistettu" })
    },
    onError: (error) => {
      setSnackbar({
        type: "error",
        message: error instanceof Error ? error.message : "Käyttäjän poisto epäonnistui",
      })
    },
  })

  const addManualGameMutation = useMutation({
    mutationFn: () =>
      saveGames(
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
        selectedTeam!.id
      ),
    onSuccess: (saved) => {
      if (saved.length > 0) {
        setSnackbar({ type: "success", message: "Ottelu lisätty!" })
        setManualGame(INITIAL_MANUAL_GAME)
        setShowManualForm(false)
        queryClient.invalidateQueries({ queryKey: ["games", selectedTeam?.id] })
      }
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Ottelun lisäys epäonnistui" })
    },
  })

  const deleteTeamMutation = useMutation({
    mutationFn: () => deleteTeam(selectedTeam!.id),
    onSuccess: () => {
      setSnackbar({ type: "info", message: "Joukkue poistettu" })
    },
    onError: () => {
      setSnackbar({ type: "error", message: "Joukkueen poistaminen epäonnistui" })
    },
  })

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setSnackbar({ type: "error", message: "Valitse Excel-tiedosto (.xlsx tai .xls)" })
      return
    }
    const arrayBuffer = await file.arrayBuffer()
    const parsed = parseExcelFile(arrayBuffer)
    setParsedGames(parsed)
    if (parsed.length === 0) {
      setSnackbar({ type: "info", message: "Excel-tiedostosta ei löytynyt otteluita" })
      return
    }
    setSnackbar(null)
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

  const handleCancelImport = useCallback(() => {
    setParsedGames([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const openConfirmDialog = useCallback(
    (message: string, onConfirm: () => void, title?: string) => {
      setConfirmDialog({ open: true, message, onConfirm, title })
    },
    []
  )

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }, [])

  const handleDeleteGame = useCallback(
    (gameId: string) => {
      const game = existingGames.find((g) => g.id === gameId)
      if (!game) return
      openConfirmDialog(`Poistetaanko ${game.homeTeam} vs ${game.awayTeam}?`, () =>
        deleteGameMutation.mutate(gameId)
      )
    },
    [existingGames, deleteGameMutation, openConfirmDialog]
  )

  const handleOpenEditGame = useCallback(
    (gameId: string) => {
      const game = existingGames.find((g) => g.id === gameId)
      if (!game) return
      setEditDialog({
        open: true,
        gameId: game.id,
        division: game.divisionId,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        date: game.date,
        time: game.time,
        location: game.location,
        dateLabel: formatDate(game.date),
      })
    },
    [existingGames]
  )

  const handleCloseEditDialog = useCallback(() => {
    setEditDialog((prev) => ({ ...prev, open: false }))
  }, [])

  const handleSaveEditGame = useCallback(() => {
    if (!editDialog.gameId) return
    updateGameDetailsMutation.mutate({
      gameId: editDialog.gameId,
      divisionId: editDialog.division.trim(),
      homeTeam: editDialog.homeTeam.trim(),
      awayTeam: editDialog.awayTeam.trim(),
      date: editDialog.date.trim(),
      time: editDialog.time.trim(),
      location: editDialog.location.trim(),
    })
  }, [editDialog, updateGameDetailsMutation])

  const handleAddPlayers = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const names = playerNames
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean)
      if (names.length === 0) return
      addPlayersMutation.mutate(names)
    },
    [playerNames, addPlayersMutation]
  )

  const handleAddManager = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      if (!managerEmail.trim()) return
      addManagerMutation.mutate(managerEmail.trim())
    },
    [managerEmail, addManagerMutation]
  )

  const handleDeletePlayer = useCallback(
    (id: string) => {
      const player = players.find((p) => p.id === id)
      if (!player) return
      openConfirmDialog(`Haluatko varmasti poistaa pelaajan ${player.name}?`, () =>
        deletePlayerMutation.mutate(id)
      )
    },
    [players, deletePlayerMutation, openConfirmDialog]
  )

  const updateManualGame = (field: keyof typeof INITIAL_MANUAL_GAME, value: string | boolean) =>
    setManualGame((prev) => ({ ...prev, [field]: value }))

  const handleAddManualGame = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!manualGame.homeTeam || !manualGame.awayTeam || !manualGame.date || !manualGame.time)
        return
      addManualGameMutation.mutate()
    },
    [manualGame, addManualGameMutation]
  )

  const handleDeleteTeam = useCallback(() => {
    if (!selectedTeam) return
    openConfirmDialog(
      `Haluatko varmasti poistaa joukkueen "${selectedTeam.name}"? Tämä poistaa myös kaikki joukkueen ottelut sekä pelaajat.`,
      () => deleteTeamMutation.mutate(),
      "Poista joukkue"
    )
  }, [selectedTeam, deleteTeamMutation, openConfirmDialog])

  const handleClearAll = useCallback(() => {
    openConfirmDialog("Haluatko varmasti poistaa kaikki ottelut?", () =>
      clearGamesMutation.mutate()
    )
  }, [clearGamesMutation, openConfirmDialog])

  const canSaveEditGame =
    editDialog.homeTeam.trim().length > 0 &&
    editDialog.awayTeam.trim().length > 0 &&
    editDialog.date.trim().length > 0 &&
    editDialog.time.trim().length > 0

  let subtitle = "Pelaajat ja otteluiden tuonti"
  let content: React.ReactNode

  if (authLoading) {
    content = (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    )
  } else if (!user) {
    content = (
      <Stack alignItems="center" py={8}>
        <Typography>Joukkueenjohtajan hallintapaneeli, vain kirjautuneille käyttäjille.</Typography>
        <Button component={NextLink} href="/">
          Siirry etusivulle
        </Button>
      </Stack>
    )
  } else if (teamLoading) {
    content = (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    )
  } else if (!selectedTeam) {
    content = (
      <Stack alignItems="center" py={8}>
        <GroupsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Valitse tai luo joukkue
        </Typography>
        <Typography color="text.secondary" mb={3} textAlign="center">
          Joukkueenjohtaja luo joukkueen ja lisää pelaajat sekä kotipelit.
        </Typography>
        <TeamSelector showCreateButton />
        <Button
          component={NextLink}
          href="/kayttoohjeet"
          size="small"
          startIcon={<HelpOutlineIcon />}
          sx={{ mt: 4, color: "text.secondary" }}
        >
          Käyttöohjeet
        </Button>
      </Stack>
    )
  } else {
    subtitle = selectedTeam.name
    content = (
      <Stack gap={3}>
        {/* Team Management */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            {!authLoading && <AuthActionButton />}
            <Button
              color="error"
              size="small"
              startIcon={<DeleteForeverIcon />}
              onClick={handleDeleteTeam}
              disabled={deleteTeamMutation.isPending}
            >
              Poista joukkue
            </Button>
          </Stack>
        </Box>
        <TeamSelector showCreateButton />

        <Card>
          <CardContent>
            <Stack gap={2}>
              <Box>
                <Typography variant="h6">Käyttöoikeudet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Lisää käyttäjien sähköpostiosoitteet jotka voivat hallita tämän joukkueen
                  otteluita ja pelaajia.
                </Typography>
              </Box>
              {managersLoading ? (
                <Stack alignItems="center" py={2}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {managers.map((manager) => {
                    const isSelf = manager.email === userEmail
                    const isLastManager = managers.length === 1
                    const canRemove = isAdmin || !(isSelf && isLastManager)
                    return (
                      <Chip
                        key={manager.id}
                        label={manager.email}
                        onDelete={
                          canRemove ? () => removeManagerMutation.mutate(manager.email) : undefined
                        }
                        deleteIcon={canRemove ? <CloseIcon /> : undefined}
                      />
                    )
                  })}
                </Stack>
              )}
              <Box component="form" onSubmit={handleAddManager}>
                <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label="Lisää käyttäjä sähköpostilla"
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={addManagerMutation.isPending}
                  >
                    Lisää
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Accordion
            expanded={playersExpanded || shouldExpandPlayers}
            onChange={(_, isExpanded) => setPlayersExpanded(isExpanded)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              data-testid="players-accordion-toggle"
            >
              <Typography component="h2" sx={{ fontSize: "1.25rem" }}>
                Joukkueen pelaajat ({players.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Joukkueen pelaajat toimitsijavuorovastuun valintalistaan.</Typography>
              {playersLoading ? (
                <Stack alignItems="center" py={2}>
                  <CircularProgress size={24} />
                </Stack>
              ) : (
                players.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1} my={2}>
                    {[...players]
                      .sort((a, b) => a.name.localeCompare(b.name, "fi"))
                      .map((player) => (
                        <Chip
                          key={player.id}
                          label={player.name}
                          onDelete={() => handleDeletePlayer(player.id)}
                          deleteIcon={<CloseIcon data-testid={`player-delete-${player.id}`} />}
                          data-testid={`player-chip-${player.id}`}
                        />
                      ))}
                  </Stack>
                )
              )}
              <form onSubmit={handleAddPlayers}>
                <TextField
                  multiline
                  minRows={4}
                  fullWidth
                  value={playerNames}
                  onChange={(e) => setPlayerNames(e.target.value)}
                  placeholder="Lisää pelaajia (yksi per rivi)"
                  inputProps={{ "data-testid": "players-textarea" }}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  data-testid="players-add-submit"
                  disabled={addPlayersMutation.isPending}
                  startIcon={
                    addPlayersMutation.isPending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {addPlayersMutation.isPending ? "Lisätään..." : "Lisää pelaajat"}
                </Button>
              </form>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={importExpanded || shouldExpandImport}
            onChange={(_, isExpanded) => setImportExpanded(isExpanded)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} data-testid="import-accordion-toggle">
              <Typography component="h2" sx={{ fontSize: "1.25rem" }}>
                Tuo otteluita
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Tuo ottelut joko elsa-myclub muuntimella tehdyistä excel-tiedostosta tai MyClubin
                tapahtumalistauksesta ladatusta excel-tiedostosta. Voit myös lisätä otteluita
                yksitellen painamalla &quot;Lisää manuaalisesti&quot; painiketta.
              </Typography>
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
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  data-testid="excel-upload-button"
                >
                  Valitse tiedosto
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    data-testid="excel-upload-input"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  startIcon={showManualForm ? <RemoveIcon /> : <AddIcon />}
                  onClick={() => setShowManualForm(!showManualForm)}
                  variant="outlined"
                  data-testid="manual-game-toggle"
                >
                  {showManualForm ? "Piilota lomake" : "Lisää manuaalisesti"}
                </Button>
              </Box>
              {/* Manual game form */}
              {showManualForm && (
                <Box
                  component="form"
                  data-testid="manual-game-form"
                  onSubmit={handleAddManualGame}
                  sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Lisää ottelu manuaalisesti
                  </Typography>
                  <Stack gap={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                      <TextField
                        label="Koti"
                        size="small"
                        required
                        value={manualGame.homeTeam}
                        onChange={(e) => updateManualGame("homeTeam", e.target.value)}
                        inputProps={{ "data-testid": "manual-game-home" }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Vieras"
                        size="small"
                        required
                        value={manualGame.awayTeam}
                        onChange={(e) => updateManualGame("awayTeam", e.target.value)}
                        inputProps={{ "data-testid": "manual-game-away" }}
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
                        inputProps={{ "data-testid": "manual-game-date" }}
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
                        inputProps={{ "data-testid": "manual-game-time" }}
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
                      <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={addManualGameMutation.isPending}
                        data-testid="manual-game-submit"
                        startIcon={
                          addManualGameMutation.isPending ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : null
                        }
                      >
                        {addManualGameMutation.isPending ? "Lisätään..." : "Lisää ottelu"}
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
                  <Typography variant="h6" data-testid="import-preview-title">
                    Esikatselu: {parsedGames.length} ottelua
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tarkista tuotavien otteluiden oikeellisuus, merkitse kotipelit rastilla ja paina
                    &quot;Tuo ottelut&quot; painiketta tallentaaksesi ottelut.
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="nowrap"
                  sx={{ ml: 4 }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancelImport}
                    disabled={importMutation.isPending}
                    data-testid="import-cancel"
                  >
                    Peruuta
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => importMutation.mutate()}
                    disabled={importMutation.isPending}
                    data-testid="import-submit"
                    sx={{ textWrap: "nowrap" }}
                  >
                    Tuo ottelut
                  </Button>
                </Stack>
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
                testIdPrefix="import-preview"
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
                Merkitse kotipelit rastilla jotta niihin voi lisätä toimitsijoita. Voit myös poistaa
                ja muokata jo lisättyjä otteluita. Järjestelmä tallentaa valinnan automaattisesti.
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
                onToggleHomeGame={(gameId, isHomeGame) =>
                  toggleHomeGameMutation.mutate({ gameId, isHomeGame })
                }
                onEdit={isAdmin ? handleOpenEditGame : undefined}
                onDelete={handleDeleteGame}
                testIdPrefix="existing-games"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  color="error"
                  size="small"
                  startIcon={<DeleteForeverIcon />}
                  onClick={handleClearAll}
                  disabled={clearGamesMutation.isPending}
                >
                  Poista kaikki ottelut
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    )
  }

  return (
    <PageLayout subtitle={subtitle}>
      {content}

      {/* Edit Game Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        aria-labelledby="edit-game-dialog-title"
      >
        <DialogTitle id="edit-game-dialog-title">Muokkaa ottelua</DialogTitle>
        <DialogContent>
          <Stack gap={2} mt={2}>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              {renderEditField(
                "Sarja",
                editDialog.division,
                (value) => setEditDialog((prev) => ({ ...prev, division: value })),
                "edit-game-division"
              )}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              {renderEditField(
                "Päivämäärä",
                editDialog.date,
                (value) => setEditDialog((prev) => ({ ...prev, date: value })),
                "edit-game-date",
                { type: "date" }
              )}
              {renderEditField(
                "Aika",
                editDialog.time,
                (value) => setEditDialog((prev) => ({ ...prev, time: value })),
                "edit-game-time",
                { type: "time" }
              )}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              {renderEditField(
                "Koti",
                editDialog.homeTeam,
                (value) => setEditDialog((prev) => ({ ...prev, homeTeam: value })),
                "edit-game-home"
              )}
              {renderEditField(
                "Vieras",
                editDialog.awayTeam,
                (value) => setEditDialog((prev) => ({ ...prev, awayTeam: value })),
                "edit-game-away"
              )}
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              {renderEditField(
                "Paikka",
                editDialog.location,
                (value) => setEditDialog((prev) => ({ ...prev, location: value })),
                "edit-game-location",
                { flex: 2 }
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Peruuta</Button>
          <Button
            onClick={handleSaveEditGame}
            disabled={!canSaveEditGame || updateGameDetailsMutation.isPending}
            variant="contained"
          >
            Tallenna
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {confirmDialog.title && (
          <DialogTitle id="alert-dialog-title">{confirmDialog.title}</DialogTitle>
        )}
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Peruuta</Button>
          <Button
            onClick={() => {
              confirmDialog.onConfirm()
              closeConfirmDialog()
            }}
            color="error"
            autoFocus
            data-testid="confirm-dialog-submit"
          >
            Poista
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Snackbar - for all status information messages! */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={snackbar?.type}
          onClose={() => setSnackbar(null)}
          sx={{ width: "100%" }}
          variant="filled"
          data-testid="status-snackbar"
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}
