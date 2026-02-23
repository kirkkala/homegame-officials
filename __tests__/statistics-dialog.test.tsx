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
})
