/// <reference types="@testing-library/jest-dom" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, fireEvent } from "@testing-library/react"
import HallintaPage from "../app/hallinta/page"

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
  getGames: jest.fn().mockResolvedValue([]),
  getPlayers: jest.fn().mockResolvedValue([]),
  getTeamManagers: jest.fn().mockResolvedValue([]),
  saveGames: jest.fn().mockResolvedValue([]),
  clearAllGames: jest.fn().mockResolvedValue(undefined),
  savePlayer: jest.fn().mockResolvedValue(undefined),
  deletePlayer: jest.fn().mockResolvedValue(undefined),
  updateGameHomeStatus: jest.fn().mockResolvedValue(undefined),
  deleteGame: jest.fn().mockResolvedValue(undefined),
  addTeamManager: jest.fn().mockResolvedValue(undefined),
  removeTeamManager: jest.fn().mockResolvedValue(undefined),
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
    renderHallintaPage()

    const label = screen.getByText("Valitse tiedosto").closest("label")
    expect(label).toBeInTheDocument()
    const input = label?.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["not excel"], "games.txt", { type: "text/plain" })

    fireEvent.change(input, { target: { files: [file] } })

    const errorMessage = await screen.findByText("Valitse Excel-tiedosto (.xlsx tai .xls)")
    expect(errorMessage).toBeInTheDocument()
    expect(mockParseExcelFile).not.toHaveBeenCalled()
  })

  it("renders preview after successful excel upload", async () => {
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

    const label = screen.getByText("Valitse tiedosto").closest("label")
    const input = label?.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["excel"], "games.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText("Esikatselu: 2 ottelua")).toBeInTheDocument()
    expect(screen.getByText("HNMKY — KlaNMKY")).toBeInTheDocument()
    expect(screen.getByText("ToPo — HNMKY")).toBeInTheDocument()
  })
})
