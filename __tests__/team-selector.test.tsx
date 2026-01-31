/// <reference types="@testing-library/jest-dom" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, fireEvent, within } from "@testing-library/react"
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

    expect(screen.queryByTestId("team-select")).not.toBeInTheDocument()
    expect(screen.queryByTestId("team-create-button")).not.toBeInTheDocument()
  })

  it("renders team list and selected value", async () => {
    renderTeamSelector()

    const select = screen.getByTestId("team-select")
    const combobox = within(select).getByRole("combobox")
    fireEvent.mouseDown(combobox)

    expect(await screen.findByTestId("team-option-team-1")).toBeInTheDocument()
    expect(screen.getByTestId("team-option-team-2")).toBeInTheDocument()
  })

  it("updates selection when choosing a team", async () => {
    const user = userEvent.setup()
    renderTeamSelector()

    const select = screen.getByTestId("team-select")
    const combobox = within(select).getByRole("combobox")
    fireEvent.mouseDown(combobox)

    const teamOption = await screen.findByTestId("team-option-team-2")
    await user.click(teamOption)

    expect(baseTeamContext.selectTeam).toHaveBeenCalledWith("team-2")
  })

  it("opens create dialog from menu when enabled and user logged in", async () => {
    const user = userEvent.setup()
    renderTeamSelector({ showCreateButton: true })

    const select = screen.getByTestId("team-select")
    const combobox = within(select).getByRole("combobox")
    fireEvent.mouseDown(combobox)

    const createOption = await screen.findByTestId("team-option-create")
    await user.click(createOption)

    expect(await screen.findByTestId("team-create-dialog")).toBeInTheDocument()
    expect(screen.getByTestId("team-create-input")).toBeInTheDocument()
  })

  it("shows create button when no teams", () => {
    mockUseTeam.mockReturnValue({ ...baseTeamContext, teams: [] })
    renderTeamSelector()

    expect(screen.getByTestId("team-create-button")).toBeInTheDocument()
  })

  it("disables create button when user is not logged in", () => {
    mockUseSession.mockReturnValue({ data: null })
    mockUseTeam.mockReturnValue({ ...baseTeamContext, teams: [] })
    renderTeamSelector()

    expect(screen.getByTestId("team-create-button")).toBeDisabled()
  })
})
