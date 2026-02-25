/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StatisticsDialog } from "@/components/statistics-dialog"
import { makeGame } from "./helpers"

describe("StatisticsDialog", () => {
  it("shows empty state when no confirmed shifts", () => {
    render(<StatisticsDialog open={true} onClose={() => {}} games={[]} />)

    expect(screen.getByText("Ei vielä vahvistettuja toimitsijavuoroja.")).toBeInTheDocument()
  })

  it("shows player names with counts", () => {
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Matti Meikäläinen", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Teppo Testaaja", handledBy: "pool", confirmedBy: null },
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: { playerName: "Matti Meikäläinen", handledBy: "pool", confirmedBy: null },
          kello: null,
        },
      }),
    ]

    render(<StatisticsDialog open={true} onClose={() => {}} games={games} />)

    expect(screen.getByText("Matti Meikäläinen")).toBeInTheDocument()
    expect(screen.getByText("Teppo Testaaja")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument() // Matti's count
    expect(screen.getByText("1")).toBeInTheDocument() // Teppo's count
  })

  it("does not count unconfirmed assignments", () => {
    const games = [
      makeGame({
        officials: {
          poytakirja: { playerName: "Matti", handledBy: null, confirmedBy: null },
          kello: { playerName: "Teppo", handledBy: "guardian", confirmedBy: "Liisa" },
        },
      }),
    ]

    render(<StatisticsDialog open={true} onClose={() => {}} games={games} />)

    expect(screen.queryByText("Matti")).not.toBeInTheDocument()
    expect(screen.getByText("Teppo")).toBeInTheDocument()
  })

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    render(<StatisticsDialog open={true} onClose={onClose} games={[]} />)

    await user.click(screen.getByRole("button", { name: "Sulje" }))

    expect(onClose).toHaveBeenCalled()
  })

  it("renders dialog title", () => {
    render(<StatisticsDialog open={true} onClose={() => {}} games={[]} />)

    expect(screen.getByText("Toimitsijavuorotilasto")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    render(<StatisticsDialog open={false} onClose={() => {}} games={[]} />)

    expect(screen.queryByText("Toimitsijavuorotilasto")).not.toBeInTheDocument()
  })

  it("shows medals when there are clear winners", () => {
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Matti", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: { playerName: "Teppo", handledBy: "guardian", confirmedBy: "E" },
          kello: null,
        },
      }),
    ]

    render(<StatisticsDialog open={true} onClose={() => {}} games={games} />)

    // Matti has 2, Teppo has 1 - both get medals (gold and silver)
    const trophyIcons = screen.getAllByTestId("EmojiEventsIcon")
    expect(trophyIcons).toHaveLength(2)
  })

  it("shares medal position when 2 players are tied", () => {
    // Camilla 3, Hilkka 3, Freyja 2, Julia 1
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Camilla", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: { playerName: "Camilla", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g3",
        officials: {
          poytakirja: { playerName: "Camilla", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g4",
        officials: {
          poytakirja: { playerName: "Freyja", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Julia", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g5",
        officials: {
          poytakirja: { playerName: "Freyja", handledBy: "guardian", confirmedBy: "E" },
          kello: null,
        },
      }),
    ]

    render(<StatisticsDialog open={true} onClose={() => {}} games={games} />)

    // Camilla & Hilkka tied for 1st (gold), Freyja is 3rd (bronze), Julia has no medal
    const trophyIcons = screen.getAllByTestId("EmojiEventsIcon")
    expect(trophyIcons).toHaveLength(3) // 2 gold + 1 bronze
  })

  it("does not award medal when more than 2 players share a position", () => {
    // Hilkka 4, Camilla 3, then many with 1
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Camilla", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Camilla", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g3",
        officials: {
          poytakirja: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Camilla", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g4",
        officials: {
          poytakirja: { playerName: "Hilkka", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Freyja", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
      makeGame({
        id: "g5",
        officials: {
          poytakirja: { playerName: "Julia", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Kira", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
    ]

    render(<StatisticsDialog open={true} onClose={() => {}} games={games} />)

    // Hilkka (4) gold, Camilla (3) silver, but Freyja/Julia/Kira (1 each) - no bronze (3+ tied)
    const trophyIcons = screen.getAllByTestId("EmojiEventsIcon")
    expect(trophyIcons).toHaveLength(2) // gold + silver only
  })

  it("does not show medals when all players have the same count", () => {
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Teppo", handledBy: "guardian", confirmedBy: "E" },
        },
      }),
    ]

    render(<StatisticsDialog open={true} onClose={() => {}} games={games} />)

    // Both have 1 shift - no clear winner, no medals
    const trophyIcons = screen.queryAllByTestId("EmojiEventsIcon")
    expect(trophyIcons).toHaveLength(0)
  })
})
