/// <reference types="@testing-library/jest-dom" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { GameCard } from "@/components/game-card"

const mockGetPlayers = jest.fn()
const mockUpdateOfficial = jest.fn()

jest.mock("@/lib/storage", () => ({
  getPlayers: (...args: unknown[]) => mockGetPlayers(...args),
  updateOfficial: (...args: unknown[]) => mockUpdateOfficial(...args),
}))

const baseGame = {
  id: "game-1",
  teamId: "team-1",
  divisionId: "II Div.",
  homeTeam: "HNMKY Stadi 2014",
  awayTeam: "KlaNMKY",
  isHomeGame: true,
  date: "2025-01-30",
  time: "18:30",
  location: "Halli 1",
  officials: {
    poytakirja: null,
    kello: null,
  },
  createdAt: "2025-01-01T00:00:00Z",
}

const renderGameCard = (gameOverride = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <GameCard game={{ ...baseGame, ...gameOverride }} />
    </QueryClientProvider>
  )
}

const openPoytakirjaMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByRole("button", { name: /Pöytäkirja \(eSCO\)/i })
  await user.click(button)
}

describe("game-card official button", () => {
  beforeEach(() => {
    mockGetPlayers.mockResolvedValue([
      { id: "p1", teamId: "team-1", name: "Matti Meikäläinen", createdAt: "2025-01-01" },
      { id: "p2", teamId: "team-1", name: "Teppo Testaaja", createdAt: "2025-01-02" },
    ])
    mockUpdateOfficial.mockResolvedValue(baseGame)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("shows player list when selector opens", async () => {
    const user = userEvent.setup()
    renderGameCard()

    await openPoytakirjaMenu(user)

    expect(await screen.findByText("Matti Meikäläinen")).toBeInTheDocument()
    expect(screen.getByText("Teppo Testaaja")).toBeInTheDocument()
  })

  it("selecting a player updates the assignment", async () => {
    const user = userEvent.setup()
    renderGameCard()

    await openPoytakirjaMenu(user)

    const playerItem = await screen.findByText("Matti Meikäläinen")
    await user.click(playerItem)

    expect(mockUpdateOfficial).toHaveBeenCalledWith("game-1", "team-1", "poytakirja", {
      playerName: "Matti Meikäläinen",
      handledBy: null,
      confirmedBy: null,
    })
  })

  it("opens guardian confirmation dialog from menu", async () => {
    const user = userEvent.setup()
    renderGameCard({
      officials: {
        poytakirja: { playerName: "Matti Meikäläinen", handledBy: null, confirmedBy: null },
        kello: null,
      },
    })

    await openPoytakirjaMenu(user)

    const guardianOption = await screen.findByText("Huoltaja tekee vuoron")
    await user.click(guardianOption)

    expect(
      await screen.findByLabelText("Huoltajan/vuoron tekijän nimi")
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Vahvista" })).toBeDisabled()
  })

  it("submits guardian confirmation with required name", async () => {
    const user = userEvent.setup()
    renderGameCard({
      officials: {
        poytakirja: { playerName: "Matti Meikäläinen", handledBy: null, confirmedBy: null },
        kello: null,
      },
    })

    await openPoytakirjaMenu(user)

    const guardianOption = await screen.findByText("Huoltaja tekee vuoron")
    await user.click(guardianOption)

    const nameInput = await screen.findByLabelText("Huoltajan/vuoron tekijän nimi")
    await user.type(nameInput, "Eeva Example")

    const confirmButton = screen.getByRole("button", { name: "Vahvista" })
    expect(confirmButton).toBeEnabled()
    await user.click(confirmButton)

    expect(mockUpdateOfficial).toHaveBeenCalledWith("game-1", "team-1", "poytakirja", {
      playerName: "Matti Meikäläinen",
      handledBy: "guardian",
      confirmedBy: "Eeva Example",
    })
  })

  it("submits pool confirmation without a name", async () => {
    const user = userEvent.setup()
    renderGameCard({
      officials: {
        poytakirja: { playerName: "Matti Meikäläinen", handledBy: null, confirmedBy: null },
        kello: null,
      },
    })

    await openPoytakirjaMenu(user)

    const poolOption = await screen.findByText("Juniori poolista")
    await user.click(poolOption)

    const confirmButton = screen.getByRole("button", { name: "Vahvista" })
    expect(confirmButton).toBeEnabled()
    await user.click(confirmButton)

    expect(mockUpdateOfficial).toHaveBeenCalledWith("game-1", "team-1", "poytakirja", {
      playerName: "Matti Meikäläinen",
      handledBy: "pool",
      confirmedBy: null,
    })
  })

  it("prefills guardian edit dialog with existing name", async () => {
    const user = userEvent.setup()
    renderGameCard({
      officials: {
        poytakirja: {
          playerName: "Matti Meikäläinen",
          handledBy: "guardian",
          confirmedBy: "Eeva Example",
        },
        kello: null,
      },
    })

    await openPoytakirjaMenu(user)

    const editOption = await screen.findByText("Muokkaa vuoron tekijän nimeä")
    await user.click(editOption)

    expect(await screen.findByDisplayValue("Eeva Example")).toBeInTheDocument()
  })

  it("shows pool edit dialog with optional name", async () => {
    const user = userEvent.setup()
    renderGameCard({
      officials: {
        poytakirja: {
          playerName: "Matti Meikäläinen",
          handledBy: "pool",
          confirmedBy: null,
        },
        kello: null,
      },
    })

    await openPoytakirjaMenu(user)

    const editOption = await screen.findByText("Lisää juniorin nimi")
    await user.click(editOption)

    expect(await screen.findByLabelText("Juniorin nimi (valinnainen)")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Vahvista" })).toBeEnabled()
  })

  it("shows pool edit label when name exists", async () => {
    const user = userEvent.setup()
    renderGameCard({
      officials: {
        poytakirja: {
          playerName: "Matti Meikäläinen",
          handledBy: "pool",
          confirmedBy: "Teppo Testaaja",
        },
        kello: null,
      },
    })

    await openPoytakirjaMenu(user)

    const editOption = await screen.findByText("Muokkaa juniorin nimeä")
    await user.click(editOption)

    expect(await screen.findByDisplayValue("Teppo Testaaja")).toBeInTheDocument()
  })
})
