/// <reference types="@testing-library/jest-dom/vitest" />

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReboundTracker } from "@/components/rebound-tracker"
import { makeGame } from "@/test-utils"

const baseGame = makeGame({
  homeTeam: "Stadi",
  awayTeam: "KlaNMKY",
  rebounds: { counterName: null, events: [], isCounter: false },
})

describe("ReboundTracker", () => {
  it("lets a person claim counting", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn().mockResolvedValue({})
    render(<ReboundTracker game={baseGame} isCounter={false} onAction={onAction} />)

    await user.click(screen.getByTestId("rebound-claim"))
    await user.type(screen.getByTestId("rebound-claim-name"), "Timo")
    await user.click(screen.getByTestId("rebound-claim-submit"))

    expect(onAction).toHaveBeenCalledWith({ action: "claim", name: "Timo", takeOver: false })
  })

  it("shows the empty-name error in the dialog", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<ReboundTracker game={baseGame} isCounter={false} onAction={onAction} />)

    await user.click(screen.getByTestId("rebound-claim"))
    await user.click(screen.getByTestId("rebound-claim-submit"))

    expect(screen.getByText("Syötä nimesi")).toBeInTheDocument()
    expect(onAction).not.toHaveBeenCalled()
  })

  it("adds a rebound from a big button when this person is counting", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn().mockResolvedValue({})
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: { counterName: "Timo", events: [], isCounter: true },
        }}
        isCounter
        onAction={onAction}
      />
    )

    await user.click(screen.getByTestId("rebound-btn-home-home"))

    expect(onAction).toHaveBeenCalledWith({ action: "add", basket: "home", winner: "home" })
  })

  it("undoes the last rebound", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn().mockResolvedValue({})
    const event = {
      id: "e1",
      basket: "home" as const,
      winner: "away" as const,
      createdAt: "2026-10-07T18:00:00.000Z",
    }
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: { counterName: "Timo", events: [event], isCounter: true },
        }}
        isCounter
        onAction={onAction}
      />
    )

    expect(screen.getByTestId("rebound-undo")).toHaveTextContent("Peru viimeisin")
    await user.click(screen.getByTestId("rebound-undo"))
    expect(onAction).toHaveBeenCalledWith({ action: "undo" })
  })

  it("shows a read-only view when someone else is counting", () => {
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: { counterName: "Aino", events: [], isCounter: false },
        }}
        isCounter={false}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByText("Aino kirjaa levypalloja")).toBeInTheDocument()
    expect(screen.getByTestId("rebound-takeover")).toBeInTheDocument()
    expect(screen.getByTestId("rebound-btn-home-home")).toBeDisabled()
  })

  it("shows team basket labels and totals", () => {
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: {
            counterName: "Timo",
            events: [
              {
                id: "e1",
                basket: "home",
                winner: "home",
                createdAt: "2026-10-07T18:00:00.000Z",
              },
              {
                id: "e2",
                basket: "away",
                winner: "away",
                createdAt: "2026-10-07T18:01:00.000Z",
              },
            ],
            isCounter: true,
          },
        }}
        isCounter
        onAction={vi.fn()}
      />
    )

    expect(screen.getByText("Stadi hyökkäyspääty / KlaNMKY puolustuspääty")).toBeInTheDocument()
    expect(screen.getByText("Stadi puolustuspääty / KlaNMKY hyökkäyspääty")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Hyökkäys" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Puolustus" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Yhteensä" })).toBeInTheDocument()
  })

  it("keeps home basket first even in an away game", () => {
    render(
      <ReboundTracker
        game={makeGame({
          homeTeam: "Helmi Basket",
          awayTeam: "HNMKY/Stadi",
          isHomeGame: false,
          rebounds: { counterName: "Timo", events: [], isCounter: true },
        })}
        isCounter
        onAction={vi.fn()}
      />
    )

    expect(screen.getByTestId("rebound-btn-home-home")).toHaveTextContent("Helmi Basket")
    expect(screen.getByTestId("rebound-btn-home-away")).toHaveTextContent("HNMKY/Stadi")
    expect(screen.getByText("Helmi Basket hyökkäyspääty / HNMKY puolustuspääty")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Hyökkäys" })).toBeInTheDocument()
  })

  it("keeps long slash team names in the stats table", () => {
    render(
      <ReboundTracker
        game={makeGame({
          homeTeam: "Tapiolan Honka/Gold",
          awayTeam: "Helsingin NMKY/Stadi",
          rebounds: { counterName: "Timo", events: [], isCounter: true },
        })}
        isCounter
        onAction={vi.fn()}
      />
    )

    expect(screen.getByRole("cell", { name: "Tapiolan Honka/Gold" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Helsingin NMKY/Stadi" })).toBeInTheDocument()
  })
})
