/// <reference types="@testing-library/jest-dom" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TeamSelector } from "@/components/team-selector"

const mockUseTeam = jest.fn()
const mockUseSession = jest.fn()

jest.mock("@/components/team-context", () => ({
  useTeam: () => mockUseTeam(),
}))

jest.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}))

const baseTeamContext = {
  teams: [
    { id: "team-1", name: "HNMKY T14 Stadi", createdAt: "2025-01-01" },
    { id: "team-2", name: "HNMKY T13", createdAt: "2025-01-02" },
  ],
  selectedTeam: { id: "team-1", name: "HNMKY T14 Stadi", createdAt: "2025-01-01" },
  isLoading: false,
  selectTeam: jest.fn(),
  createTeam: jest.fn(),
  deleteTeam: jest.fn(),
  refreshTeams: jest.fn(),
}

const renderTeamSelector = (props?: React.ComponentProps<typeof TeamSelector>) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TeamSelector {...props} />
    </QueryClientProvider>
  )
}

describe("team-selector", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ data: { user: { name: "Test User" } } })
    mockUseTeam.mockReturnValue(baseTeamContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders nothing while loading", () => {
    mockUseTeam.mockReturnValue({ ...baseTeamContext, isLoading: true })
    renderTeamSelector()

    expect(screen.queryByLabelText("Joukkue")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Luo joukkue/i })).not.toBeInTheDocument()
  })

  it("renders team list and selected value", async () => {
    const user = userEvent.setup()
    renderTeamSelector()

    const select = screen.getByLabelText("Joukkue")
    await user.click(select)

    const selectedOption = await screen.findByRole("option", { name: "HNMKY T14 Stadi" })
    expect(selectedOption).toBeInTheDocument()
    expect(screen.getByText("HNMKY T13")).toBeInTheDocument()
  })

  it("updates selection when choosing a team", async () => {
    const user = userEvent.setup()
    renderTeamSelector()

    const select = screen.getByLabelText("Joukkue")
    await user.click(select)

    const teamOption = await screen.findByText("HNMKY T13")
    await user.click(teamOption)

    expect(baseTeamContext.selectTeam).toHaveBeenCalledWith("team-2")
  })

  it("opens create dialog from menu when enabled and user logged in", async () => {
    const user = userEvent.setup()
    renderTeamSelector({ showCreateButton: true })

    const select = screen.getByLabelText("Joukkue")
    await user.click(select)

    const createOption = await screen.findByText("+ Luo uusi joukkue...")
    await user.click(createOption)

    expect(await screen.findByText("Luo uusi joukkue")).toBeInTheDocument()
    expect(screen.getByLabelText("Joukkueen nimi")).toBeInTheDocument()
  })

  it("shows create button when no teams", () => {
    mockUseTeam.mockReturnValue({ ...baseTeamContext, teams: [] })
    renderTeamSelector()

    expect(screen.getByRole("button", { name: "Luo joukkue" })).toBeInTheDocument()
  })

  it("disables create button when user is not logged in", () => {
    mockUseSession.mockReturnValue({ data: null })
    mockUseTeam.mockReturnValue({ ...baseTeamContext, teams: [] })
    renderTeamSelector()

    expect(screen.getByRole("button", { name: "Luo joukkue" })).toBeDisabled()
  })
})
