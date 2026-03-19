/// <reference types="@testing-library/jest-dom" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { GamesList } from "@/components/games-list"
import * as storage from "@/lib/storage"

const mockUseTeam = jest.fn()

jest.mock("@/components/team-context", () => ({
  useTeam: () => mockUseTeam(),
}))

jest.mock("@/components/game-card", () => ({
  GameCard: ({ game }: { game: { id: string; homeTeam: string } }) => (
    <div data-testid={`game-card-${game.id}`}>{game.homeTeam}</div>
  ),
}))

jest.mock("@/components/statistics-dialog", () => ({
  StatisticsDialog: () => null,
}))

jest.mock("@/components/first-aid-bags-summary", () => ({
  FirstAidBagsSummary: () => <div data-testid="first-aid-summary-mock">First aid summary</div>,
}))

jest.mock("@/lib/storage", () => ({
  getGames: jest.fn(),
}))

const futureGame = {
  id: "g1",
  teamId: "team-1",
  divisionId: "I",
  homeTeam: "Home",
  awayTeam: "Away",
  isHomeGame: true,
  date: "2099-06-01",
  time: "18:00",
  location: "Hall",
  officials: { poytakirja: null, kello: null },
  createdAt: "2025-01-01",
}

const baseTeamContext = {
  selectedTeam: { id: "team-1", name: "Test Team", createdAt: "2025-01-01" },
  isLoading: false,
}

const renderGamesList = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <GamesList />
    </QueryClientProvider>
  )
}

describe("GamesList", () => {
  beforeEach(() => {
    mockUseTeam.mockReturnValue(baseTeamContext)
    ;(storage.getGames as jest.Mock).mockResolvedValue([futureGame])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders nothing when no team selected", () => {
    mockUseTeam.mockReturnValue({ ...baseTeamContext, selectedTeam: null })

    const { container } = renderGamesList()

    expect(container.firstChild).toBeNull()
  })

  it("shows spinner while loading games", () => {
    mockUseTeam.mockReturnValue({ ...baseTeamContext, isLoading: true })

    renderGamesList()

    expect(document.querySelector(".MuiCircularProgress-root")).toBeInTheDocument()
  })

  it("renders team name and game cards when games exist", async () => {
    renderGamesList()

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeInTheDocument()
    })
    expect(await screen.findByTestId("game-card-g1")).toBeInTheDocument()
  })

  it("does not render first aid summary mock when feature disabled", async () => {
    renderGamesList()

    await waitFor(() => {
      expect(screen.getByTestId("game-card-g1")).toBeInTheDocument()
    })
    expect(screen.queryByTestId("first-aid-summary-mock")).not.toBeInTheDocument()
  })

  it("renders first aid summary mock when firstAidBagsEnabled", async () => {
    mockUseTeam.mockReturnValue({
      ...baseTeamContext,
      selectedTeam: {
        ...baseTeamContext.selectedTeam,
        firstAidBagsEnabled: true,
      },
    })

    renderGamesList()

    expect(await screen.findByTestId("first-aid-summary-mock")).toBeInTheDocument()
  })
})
