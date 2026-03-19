/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react"
import { FirstAidBagsSummary } from "@/components/first-aid-bags-summary"

const mockUseTeam = jest.fn()
const mockUseFirstAidBags = jest.fn()

jest.mock("@/components/team-context", () => ({
  useTeam: () => mockUseTeam(),
}))

jest.mock("@/hooks/use-first-aid-bags", () => ({
  useFirstAidBags: (...args: unknown[]) => mockUseFirstAidBags(...args),
}))

describe("FirstAidBagsSummary", () => {
  beforeEach(() => {
    mockUseFirstAidBags.mockReturnValue({ bags: {}, refresh: jest.fn() })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders nothing when no team selected", () => {
    mockUseTeam.mockReturnValue({ selectedTeam: null })

    const { container } = render(<FirstAidBagsSummary />)

    expect(container.firstChild).toBeNull()
  })

  it("shows empty state when no bag holders", () => {
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "t1", name: "Team A", firstAidBagsEnabled: true, firstAidBagCount: "3" },
    })

    render(<FirstAidBagsSummary />)

    expect(screen.getByText("Ensiapulaukut")).toBeInTheDocument()
    expect(screen.getByText("Ei merkattuja haltijoita")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ensiapulaukut/i })).toHaveAttribute(
      "href",
      "/ensiapulaukut"
    )
  })

  it("lists bag slots with holders and unknowns", () => {
    mockUseTeam.mockReturnValue({
      selectedTeam: { id: "t1", name: "Team A", firstAidBagsEnabled: true, firstAidBagCount: "2" },
    })
    mockUseFirstAidBags.mockReturnValue({
      bags: {
        bag1: { name: "Matti", lastSeenAt: "2025-01-15T12:00:00.000Z" },
        bag2: null,
      },
      refresh: jest.fn(),
    })

    render(<FirstAidBagsSummary />)

    expect(screen.getByText(/#1: Matti/)).toBeInTheDocument()
    expect(screen.getByText(/#2: \?\?\?/)).toBeInTheDocument()
  })

  it("passes team to useFirstAidBags", () => {
    const team = { id: "t1", name: "Team A", firstAidBagsEnabled: true }
    mockUseTeam.mockReturnValue({ selectedTeam: team })

    render(<FirstAidBagsSummary />)

    expect(mockUseFirstAidBags).toHaveBeenCalledWith("t1", team)
  })
})
