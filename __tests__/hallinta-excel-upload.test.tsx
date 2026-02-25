/// <reference types="@testing-library/jest-dom" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import HallintaPage from "../app/hallinta/page"
import * as storage from "@/lib/storage"

const mockParseExcelFile = jest.fn()
const mockUseTeam = jest.fn()
const mockUseSession = jest.fn()

jest.mock("@/lib/excel-parser", () => ({
  parseExcelFile: (...args: unknown[]) => mockParseExcelFile(...args),
}))

jest.mock("@/components/team-context", () => ({
  useTeam: () => mockUseTeam(),
}))

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}))

jest.mock("@/components/header", () => ({
  MainHeader: () => <div data-testid="main-header" />,
}))

jest.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer" />,
}))

jest.mock("@/components/auth-action-button", () => ({
  AuthActionButton: () => <div data-testid="auth-action-button" />,
}))

jest.mock("@/components/team-selector", () => ({
  TeamSelector: () => <div data-testid="team-selector" />,
}))

jest.mock("@/lib/storage", () => ({
  getGames: jest.fn(),
  getPlayers: jest.fn(),
  getTeamManagers: jest.fn(),
  getUsers: jest.fn(),
  saveGames: jest.fn(),
  clearAllGames: jest.fn(),
  savePlayer: jest.fn(),
  deletePlayer: jest.fn(),
  updateGameHomeStatus: jest.fn(),
  updateGameDetails: jest.fn(),
  deleteGame: jest.fn(),
  addTeamManager: jest.fn(),
  removeTeamManager: jest.fn(),
}))

const renderHallintaPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <HallintaPage />
    </QueryClientProvider>
  )
}

describe("hallinta excel upload", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "test@example.com", isAdmin: true } },
      status: "authenticated",
    })
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "HNMKY T14 Stadi", createdAt: "2025-01-01" },
      isLoading: false,
      deleteTeam: jest.fn(),
    })
    mockParseExcelFile.mockReset()
    ;(storage.getGames as jest.Mock).mockResolvedValue([])
    ;(storage.getPlayers as jest.Mock).mockResolvedValue([])
    ;(storage.getTeamManagers as jest.Mock).mockResolvedValue([])
    ;(storage.getUsers as jest.Mock).mockResolvedValue([])
    ;(storage.saveGames as jest.Mock).mockResolvedValue([])
    ;(storage.clearAllGames as jest.Mock).mockResolvedValue(undefined)
    ;(storage.savePlayer as jest.Mock).mockResolvedValue(undefined)
    ;(storage.deletePlayer as jest.Mock).mockResolvedValue(undefined)
    ;(storage.updateGameHomeStatus as jest.Mock).mockResolvedValue(undefined)
    ;(storage.updateGameDetails as jest.Mock).mockResolvedValue(undefined)
    ;(storage.deleteGame as jest.Mock).mockResolvedValue(undefined)
    ;(storage.addTeamManager as jest.Mock).mockResolvedValue(undefined)
    ;(storage.removeTeamManager as jest.Mock).mockResolvedValue(undefined)

    if (!File.prototype.arrayBuffer) {
      Object.defineProperty(File.prototype, "arrayBuffer", {
        configurable: true,
        value: () => Promise.resolve(new ArrayBuffer(8)),
      })
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("shows error snackbar when uploading non-excel file", async () => {
    const user = userEvent.setup()
    renderHallintaPage()

    await user.click(screen.getByTestId("games-tab"))
    const input = screen.getByTestId("excel-upload-input") as HTMLInputElement
    const file = new File(["not excel"], "games.txt", { type: "text/plain" })

    fireEvent.change(input, { target: { files: [file] } })

    const errorMessage = await screen.findByTestId("status-snackbar")
    expect(errorMessage).toBeInTheDocument()
    expect(mockParseExcelFile).not.toHaveBeenCalled()
  })

  it("shows info snackbar when no games are found", async () => {
    const user = userEvent.setup()
    mockParseExcelFile.mockReturnValue([])
    renderHallintaPage()

    await user.click(screen.getByTestId("games-tab"))
    const input = screen.getByTestId("excel-upload-input") as HTMLInputElement
    const file = new File(["excel"], "games.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    fireEvent.change(input, { target: { files: [file] } })

    const message = await screen.findByTestId("status-snackbar")
    expect(message).toBeInTheDocument()
    expect(message).toHaveTextContent("Excel-tiedostosta ei löytynyt otteluita")
  })

  it("renders preview after successful excel upload", async () => {
    const user = userEvent.setup()
    mockParseExcelFile.mockReturnValue([
      {
        division: "I div.",
        homeTeam: "HNMKY",
        awayTeam: "KlaNMKY",
        date: "2025-01-30",
        time: "18:30",
        location: "Halli 1",
        rawName: "I div. HNMKY - KlaNMKY",
        isHomeGame: false,
      },
      {
        division: "II div.",
        homeTeam: "ToPo",
        awayTeam: "HNMKY",
        date: "2025-02-10",
        time: "19:00",
        location: "Halli 2",
        rawName: "II div. ToPo - HNMKY",
        isHomeGame: false,
      },
    ])
    renderHallintaPage()

    await user.click(screen.getByTestId("games-tab"))
    const input = screen.getByTestId("excel-upload-input") as HTMLInputElement
    const file = new File(["excel"], "games.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByTestId("import-preview-title")).toBeInTheDocument()
    expect(screen.getByTestId("import-preview-row-0")).toBeInTheDocument()
    expect(screen.getByTestId("import-preview-row-1")).toBeInTheDocument()
  })

  it("adds players from textarea", async () => {
    const user = userEvent.setup()
    renderHallintaPage()

    await user.click(screen.getByTestId("players-tab"))
    const textarea = screen.getByTestId("players-textarea")
    await user.type(textarea, "Matti Meikäläinen\nTeppo Testaaja")

    await user.click(screen.getByTestId("players-add-submit"))

    await waitFor(() => {
      expect(storage.savePlayer).toHaveBeenCalledTimes(2)
    })
    expect(storage.savePlayer).toHaveBeenCalledWith("Matti Meikäläinen", "team-1")
    expect(storage.savePlayer).toHaveBeenCalledWith("Teppo Testaaja", "team-1")
  })

  it("removes a player after confirmation", async () => {
    const user = userEvent.setup()
    ;(storage.getPlayers as jest.Mock).mockResolvedValue([
      { id: "p1", teamId: "team-1", name: "Matti Meikäläinen", createdAt: "2025-01-01" },
    ])
    renderHallintaPage()

    await user.click(screen.getByTestId("players-tab"))

    const chipRoot = screen.getByTestId("player-chip-p1")
    const deleteIcon = within(chipRoot).getByTestId("player-delete-p1")
    fireEvent.click(deleteIcon)

    const confirmButton = await screen.findByTestId("confirm-dialog-submit")
    await user.click(confirmButton)

    expect(storage.deletePlayer).toHaveBeenCalledWith("p1")
  })

  it("marks home game via checkbox", async () => {
    const user = userEvent.setup()
    ;(storage.getGames as jest.Mock).mockResolvedValue([
      {
        id: "g1",
        teamId: "team-1",
        divisionId: "I div.",
        homeTeam: "HNMKY",
        awayTeam: "KlaNMKY",
        isHomeGame: false,
        date: "2025-01-30",
        time: "18:30",
        location: "Halli 1",
        officials: { poytakirja: null, kello: null },
        createdAt: "2025-01-01",
      },
    ])
    renderHallintaPage()

    await user.click(screen.getByTestId("games-tab"))
    const checkbox = await screen.findByTestId("existing-games-home-toggle-g1")
    await user.click(checkbox)

    expect(storage.updateGameHomeStatus).toHaveBeenCalledWith("g1", true)
  })

  it("adds a manual game via form", async () => {
    const user = userEvent.setup()
    renderHallintaPage()

    await user.click(screen.getByTestId("games-tab"))

    const manualToggle = await screen.findByTestId("manual-game-toggle")
    await user.click(manualToggle)

    const homeInput = await screen.findByTestId("edit-game-home")
    const awayInput = screen.getByTestId("edit-game-away")
    const dateInput = screen.getByTestId("edit-game-date")
    const timeInput = screen.getByTestId("edit-game-time")

    await user.type(homeInput, "HNMKY")
    await user.type(awayInput, "KlaNMKY")
    await user.type(dateInput, "2025-02-10")
    await user.type(timeInput, "19:00")

    await user.click(screen.getByTestId("game-dialog-submit"))

    await waitFor(() => {
      expect(storage.saveGames).toHaveBeenCalledTimes(1)
    })
    expect(storage.saveGames).toHaveBeenCalledWith(
      [
        {
          divisionId: "",
          homeTeam: "HNMKY",
          awayTeam: "KlaNMKY",
          date: "2025-02-10",
          time: "19:00",
          location: "",
          isHomeGame: true,
        },
      ],
      "team-1"
    )
  })

  it("deletes a single game after confirmation", async () => {
    const user = userEvent.setup()
    ;(storage.getGames as jest.Mock).mockResolvedValue([
      {
        id: "g2",
        teamId: "team-1",
        divisionId: "II div.",
        homeTeam: "ToPo",
        awayTeam: "HNMKY",
        isHomeGame: true,
        date: "2025-02-12",
        time: "18:00",
        location: "Halli 2",
        officials: { poytakirja: null, kello: null },
        createdAt: "2025-01-01",
      },
    ])
    renderHallintaPage()

    await user.click(screen.getByTestId("games-tab"))
    const deleteButton = await screen.findByTestId("existing-games-delete-g2")
    await user.click(deleteButton)

    const confirmButton = await screen.findByTestId("confirm-dialog-submit")
    await user.click(confirmButton)

    expect(storage.deleteGame).toHaveBeenCalledWith("g2")
  })
})
