/// <reference types="@testing-library/jest-dom/vitest" />

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ReboundTracker } from "@/components/rebound-tracker"
import type { PublicReboundTracking } from "@/lib/rebounds"
import { makeGame } from "@/test-utils"

const emptyRebounds = (overrides: Partial<PublicReboundTracking> = {}): PublicReboundTracking => ({
  homeOff: 0,
  homeDef: 0,
  awayOff: 0,
  awayDef: 0,
  counterName: null,
  updatedAt: null,
  counting: false,
  isCounter: false,
  ...overrides,
})

const baseGame = makeGame({
  homeTeam: "Stadi",
  awayTeam: "KlaNMKY",
  rebounds: emptyRebounds(),
})

describe("ReboundTracker", () => {
  it("lets a person claim counting", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn().mockResolvedValue({})
    render(<ReboundTracker game={baseGame} isCounter={false} onAction={onAction} />)

    expect(screen.getByTestId("rebound-claim")).toHaveTextContent("Käynnistä tilastointi")
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
          rebounds: emptyRebounds({ counterName: "Timo", counting: true, isCounter: true }),
        }}
        isCounter
        onAction={onAction}
      />
    )

    await user.click(screen.getByTestId("rebound-btn-home-home"))

    expect(onAction).toHaveBeenCalledWith({ action: "add", basket: "home", winner: "home" })
    expect(screen.getByTestId("rebound-btn-home-home-remove")).toBeDisabled()
  })

  it("removes one from the matching rebound counter", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn().mockResolvedValue({})
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: emptyRebounds({
            counterName: "Timo",
            counting: true,
            isCounter: true,
            awayDef: 1,
          }),
        }}
        isCounter
        onAction={onAction}
      />
    )

    await user.click(screen.getByTestId("rebound-btn-home-away-remove"))
    expect(onAction).toHaveBeenCalledWith({ action: "remove", basket: "home", winner: "away" })
  })

  it("shows a read-only view when someone else is counting", () => {
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: emptyRebounds({ counterName: "Aino", counting: true }),
        }}
        isCounter={false}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByText("Aino kirjaa tilastoa")).toBeInTheDocument()
    expect(screen.getByTestId("rebound-takeover")).toBeInTheDocument()
    expect(screen.getByTestId("rebound-btn-home-home")).toBeDisabled()
    expect(screen.queryByTestId("rebound-btn-home-home-remove")).not.toBeInTheDocument()
  })

  it("keeps the recorder name after counting has stopped", () => {
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: emptyRebounds({
            counterName: "Timo",
            updatedAt: "2026-10-09T05:16:00.000Z",
            homeOff: 2,
          }),
        }}
        isCounter={false}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByTestId("rebound-claim")).toBeInTheDocument()
    expect(screen.queryByText("Timo kirjaa tilastoa")).not.toBeInTheDocument()
    expect(screen.getByTestId("rebound-meta")).toHaveTextContent("Tilastoinut Timo")
    expect(screen.getByTestId("rebound-meta")).toHaveTextContent("9.10.2026")
  })

  it("shows team basket labels and totals", () => {
    render(
      <ReboundTracker
        game={{
          ...baseGame,
          rebounds: emptyRebounds({
            counterName: "Timo",
            counting: true,
            isCounter: true,
            homeOff: 1,
            awayOff: 1,
          }),
        }}
        isCounter
        onAction={vi.fn()}
      />
    )

    expect(screen.getByText("Stadi hyökkäys")).toBeInTheDocument()
    expect(screen.getByText("KlaNMKY puolustus")).toBeInTheDocument()
    expect(screen.getByText("Stadi puolustus")).toBeInTheDocument()
    expect(screen.getByText("KlaNMKY hyökkäys")).toBeInTheDocument()
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
          rebounds: emptyRebounds({ counterName: "Timo", counting: true, isCounter: true }),
        })}
        isCounter
        onAction={vi.fn()}
      />
    )

    expect(screen.getByTestId("rebound-btn-home-home")).toHaveTextContent("Helmi Basket")
    expect(screen.getByTestId("rebound-btn-home-away")).toHaveTextContent("HNMKY")
    expect(screen.getByText("Helmi Basket hyökkäys")).toBeInTheDocument()
    expect(screen.getByText("HNMKY puolustus")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Hyökkäys" })).toBeInTheDocument()
  })

  it("keeps long slash team names in the stats table", () => {
    render(
      <ReboundTracker
        game={makeGame({
          homeTeam: "Tapiolan Honka/Gold",
          awayTeam: "Helsingin NMKY/Stadi",
          rebounds: emptyRebounds({ counterName: "Timo", counting: true, isCounter: true }),
        })}
        isCounter
        onAction={vi.fn()}
      />
    )

    expect(screen.getByTestId("rebound-btn-home-home")).toHaveTextContent("Tapiolan Honka")
    expect(screen.getByTestId("rebound-btn-home-away")).toHaveTextContent("Helsingin NMKY")
    expect(screen.getByRole("cell", { name: "Tapiolan Honka/Gold" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Helsingin NMKY/Stadi" })).toBeInTheDocument()
  })
})
