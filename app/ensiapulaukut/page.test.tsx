/// <reference types="@testing-library/jest-dom" />

import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as firstAidBags from "@/lib/first-aid-bags"
import EnsiapulaukutPage from "./page"

const mockUseTeam = jest.fn()

jest.mock("@/components/team-context", () => ({
  useTeam: () => mockUseTeam(),
}))

jest.mock("@/components/header", () => ({
  MainHeader: () => <div data-testid="main-header" />,
}))

jest.mock("@/components/footer", () => ({
  Footer: () => <div data-testid="footer" />,
}))

jest.mock("@/lib/first-aid-bags", () => ({
  getBagCountForTeam: jest.fn(),
  getFirstAidBags: jest.fn(),
  setBagHolder: jest.fn(),
  clearBagHolder: jest.fn(),
}))

describe("EnsiapulaukutPage", () => {
  beforeEach(() => {
    mockUseTeam.mockReturnValue({
      selectedTeam: null,
      isLoading: false,
    })
    ;(firstAidBags.getBagCountForTeam as jest.Mock).mockReturnValue(3)
    ;(firstAidBags.getFirstAidBags as jest.Mock).mockResolvedValue({
      bag1: null,
      bag2: null,
      bag3: null,
    })
    ;(firstAidBags.setBagHolder as jest.Mock).mockResolvedValue({})
    ;(firstAidBags.clearBagHolder as jest.Mock).mockResolvedValue({})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading spinner when isLoading", () => {
    mockUseTeam.mockReturnValue({ selectedTeam: null, isLoading: true })

    render(<EnsiapulaukutPage />)

    expect(screen.getByTestId("main-header")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
    expect(document.querySelector(".MuiCircularProgress-root")).toBeInTheDocument()
  })

  it("shows select team message when no team selected", () => {
    render(<EnsiapulaukutPage />)

    expect(screen.getByRole("heading", { name: /ensiapulaukut/i })).toBeInTheDocument()
    expect(screen.getByText("Valitse joukkue nähdäksesi ensiapulaukut.")).toBeInTheDocument()
  })

  it("shows team name and bag cards when team selected", async () => {
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "HNMKY T14" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    expect(
      screen.getByRole("heading", { name: /HNMKY T14 ensiapulaukkujen haltijat/i })
    ).toBeInTheDocument()
    expect(screen.getByTestId("bag-card-1")).toBeInTheDocument()
    expect(screen.getByTestId("bag-card-2")).toBeInTheDocument()
    expect(screen.getByTestId("bag-card-3")).toBeInTheDocument()
    expect(firstAidBags.getFirstAidBags).toHaveBeenCalledWith("team-1")
  })

  it("shows empty state when bag has no holder", async () => {
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    const card1 = screen.getByTestId("bag-card-1")
    expect(
      within(card1).getByText(/oivoi, ei nimeä! toivottavasti laukku on tallessa/i)
    ).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /ota laukku haltuun/i })).toHaveLength(3)
  })

  it("shows holder name and date when bag has holder", async () => {
    const lastSeenAt = "2025-01-15T10:00:00Z"
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })
    ;(firstAidBags.getFirstAidBags as jest.Mock).mockResolvedValue({
      bag1: { name: "Matti Meikäläinen", lastSeenAt },
      bag2: null,
      bag3: null,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.getByText("Matti Meikäläinen")).toBeInTheDocument()
    })
    expect(screen.getByText(/15\.1\.2025/)).toBeInTheDocument()
  })

  it("opens dialog when clicking Ota laukku haltuun", async () => {
    const user = userEvent.setup()
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getAllByRole("button", { name: /ota laukku haltuun/i })[0])

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Ota haltuun laukku #1")).toBeInTheDocument()
    expect(screen.getByTestId("claim-bag-name")).toBeInTheDocument()
    expect(screen.getByTestId("claim-bag-submit")).toBeInTheDocument()
    expect(screen.getByTestId("claim-bag-cancel")).toBeInTheDocument()
  })

  it("calls setBagHolder when submitting name in dialog", async () => {
    const user = userEvent.setup()
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getAllByRole("button", { name: /ota laukku haltuun/i })[0])

    const nameInput = screen.getByTestId("claim-bag-name")
    await user.type(nameInput, "Matti Meikäläinen")

    await user.click(screen.getByTestId("claim-bag-submit"))

    await waitFor(() => {
      expect(firstAidBags.setBagHolder).toHaveBeenCalledWith("team-1", 1, "Matti Meikäläinen")
    })
  })

  it("shows error when submitting empty name", async () => {
    const user = userEvent.setup()
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getAllByRole("button", { name: /ota laukku haltuun/i })[0])

    const submitButton = screen.getByTestId("claim-bag-submit")
    expect(submitButton).toBeDisabled()

    const nameInput = screen.getByTestId("claim-bag-name")
    await user.type(nameInput, "   ")
    fireEvent.submit(nameInput.closest("form")!)

    expect(screen.getByText("Syötä nimesi")).toBeInTheDocument()
    expect(firstAidBags.setBagHolder).not.toHaveBeenCalled()
  })

  it("closes dialog when clicking Peruuta", async () => {
    const user = userEvent.setup()
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getAllByRole("button", { name: /ota laukku haltuun/i })[0])
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    await user.click(screen.getByTestId("claim-bag-cancel"))

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("calls clearBagHolder when clicking Tyhjennä on bag with holder", async () => {
    const user = userEvent.setup()
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })
    ;(firstAidBags.getFirstAidBags as jest.Mock).mockResolvedValue({
      bag1: { name: "Matti", lastSeenAt: "2025-01-15T10:00:00Z" },
      bag2: null,
      bag3: null,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(screen.getByText("Matti")).toBeInTheDocument()
    })

    const card1 = screen.getByTestId("bag-card-1")
    await user.click(within(card1).getByRole("button", { name: "Tyhjennä" }))

    expect(firstAidBags.clearBagHolder).toHaveBeenCalledWith("team-1", 1)
  })

  it("disables Tallenna when name input is empty", async () => {
    const user = userEvent.setup()
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "team-1", name: "Test" },
      isLoading: false,
    })

    render(<EnsiapulaukutPage />)
    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getAllByRole("button", { name: /ota laukku haltuun/i })[0])

    expect(screen.getByTestId("claim-bag-submit")).toBeDisabled()
  })
})
