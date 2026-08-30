/// <reference types="@testing-library/jest-dom/vitest" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as storage from "@/lib/storage"
import HallintaPage from "./page"

const mockParseExcelFile = vi.fn()
const mockUseTeam = vi.fn()
const mockUseSession = vi.fn()

vi.mock("@/lib/excel-parser", () => ({
  parseExcelFile: (...args: unknown[]) => mockParseExcelFile(...args),
}))

vi.mock("@/components/team-context", () => ({
  useTeam: () => mockUseTeam(),
}))

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}))

vi.mock("@/components/header", () => ({
  MainHeader: () => <div data-testid="main-header" />,
}))

vi.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer" />,
}))

vi.mock("@/components/auth-action-button", () => ({
  AuthActionButton: () => <div data-testid="auth-action-button" />,
}))

vi.mock("@/components/team-selector", () => ({
  TeamSelector: () => <div data-testid="team-selector" />,
}))

vi.mock("@/lib/storage", () => ({
  getGames: vi.fn(),
  getPlayers: vi.fn(),
  getTeamManagers: vi.fn(),
  getUsers: vi.fn(),
  saveGames: vi.fn(),
  clearAllGames: vi.fn(),
  savePlayer: vi.fn(),
  deletePlayer: vi.fn(),
  updateGameHomeStatus: vi.fn(),
  updateGameDetails: vi.fn(),
  deleteGame: vi.fn(),
  addTeamManager: vi.fn(),
  removeTeamManager: vi.fn(),
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

describe("HallintaPage", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "test@example.com", isAdmin: true } },
      status: "authenticated",
    })
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "HNMKY T14 Stadi", createdAt: "2025-01-01" },
      isLoading: false,
      deleteTeam: vi.fn(),
    })
    mockParseExcelFile.mockReset()
    ;(storage.getGames as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.getPlayers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.getTeamManagers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.saveGames as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.clearAllGames as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.savePlayer as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.deletePlayer as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.updateGameHomeStatus as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.updateGameDetails as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.deleteGame as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.addTeamManager as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    ;(storage.removeTeamManager as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

    if (!File.prototype.arrayBuffer) {
      Object.defineProperty(File.prototype, "arrayBuffer", {
        configurable: true,
        value: () => Promise.resolve(new ArrayBuffer(8)),
      })
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
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
    expect(message).toHaveTextContent("Lisätystä tiedostosta ei löytynyt tuotavia otteluita")
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
        isHomeGame: true,
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
    expect(screen.getByTestId("import-preview-home-toggle-0")).toBeChecked()
    expect(screen.getByTestId("import-preview-home-toggle-1")).not.toBeChecked()
    expect(screen.getByTestId("import-cancel")).toBeInTheDocument()
    expect(screen.getByTestId("import-cancel-bottom")).toBeInTheDocument()
    expect(screen.getByTestId("import-submit")).toBeInTheDocument()
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
    ;(storage.getPlayers as ReturnType<typeof vi.fn>).mockResolvedValue([
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
    ;(storage.getGames as ReturnType<typeof vi.fn>).mockResolvedValue([
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
    ;(storage.getGames as ReturnType<typeof vi.fn>).mockResolvedValue([
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

describe("HallintaPage delete team", () => {
  const mockDeleteTeam = vi.fn()

  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { email: "test@example.com", isAdmin: true } },
      status: "authenticated",
    })
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "HNMKY T14 Stadi", createdAt: "2025-01-01" },
      isLoading: false,
      deleteTeam: mockDeleteTeam,
    })
    ;(storage.getGames as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.getPlayers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.getTeamManagers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(storage.getUsers as ReturnType<typeof vi.fn>).mockResolvedValue([])
    mockDeleteTeam.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("opens delete team dialog when clicking Poista joukkue", async () => {
    const user = userEvent.setup()
    renderHallintaPage()

    await user.click(screen.getByTestId("general-tab"))
    await user.click(screen.getByRole("button", { name: /poista joukkue/i }))

    expect(screen.getByTestId("delete-team-confirm-input")).toBeInTheDocument()
    expect(screen.getByTestId("delete-team-confirm-button")).toBeDisabled()
  })

  it("keeps confirm button disabled when team name does not match", async () => {
    const user = userEvent.setup()
    renderHallintaPage()

    await user.click(screen.getByTestId("general-tab"))
    await user.click(screen.getByRole("button", { name: /poista joukkue/i }))

    const input = screen.getByTestId("delete-team-confirm-input")
    await user.type(input, "wrong name")

    expect(screen.getByTestId("delete-team-confirm-button")).toBeDisabled()
  })

  it("enables confirm button when team name matches exactly", async () => {
    const user = userEvent.setup()
    renderHallintaPage()

    await user.click(screen.getByTestId("general-tab"))
    await user.click(screen.getByRole("button", { name: /poista joukkue/i }))

    const input = screen.getByTestId("delete-team-confirm-input")
    fireEvent.change(input, { target: { value: "HNMKY T14 Stadi" } })

    await waitFor(() => {
      expect(screen.getByTestId("delete-team-confirm-button")).toBeEnabled()
    })
  })

  it("calls deleteTeam when confirming with correct team name", async () => {
    const user = userEvent.setup()
    mockDeleteTeam.mockResolvedValue(undefined)
    renderHallintaPage()

    await user.click(screen.getByTestId("general-tab"))
    await user.click(screen.getByRole("button", { name: /poista joukkue/i }))

    const input = screen.getByTestId("delete-team-confirm-input")
    fireEvent.change(input, { target: { value: "HNMKY T14 Stadi" } })

    const confirmButton = await screen.findByTestId("delete-team-confirm-button")
    await waitFor(() => expect(confirmButton).toBeEnabled())
    await user.click(confirmButton)

    expect(mockDeleteTeam).toHaveBeenCalledWith("team-1")
  })
})
