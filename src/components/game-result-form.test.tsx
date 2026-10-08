/// <reference types="@testing-library/jest-dom/vitest" />

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { GameResultForm } from "@/components/game-result-form"
import { makeGame } from "@/test-utils"

describe("GameResultForm", () => {
  it("shortens slashed team names on the scoreboard", () => {
    render(
      <GameResultForm
        game={makeGame({
          homeTeam: "HNMKY/Stadi",
          awayTeam: "ToPo",
          result: { home: 10, away: 8 },
        })}
        onSave={vi.fn()}
      />
    )

    expect(screen.getByText("HNMKY")).toBeInTheDocument()
    expect(screen.getByText("ToPo")).toBeInTheDocument()
    expect(screen.queryByText("HNMKY/Stadi")).not.toBeInTheDocument()
  })

  it("shows the score for watchers without live buttons", () => {
    render(<GameResultForm game={makeGame({ result: { home: 10, away: 8 } })} onSave={vi.fn()} />)

    expect(screen.getByTestId("game-result-home-score")).toHaveTextContent("10")
    expect(screen.getByTestId("game-result-away-score")).toHaveTextContent("8")
    expect(screen.queryByTestId("game-result-home-add-2")).not.toBeInTheDocument()
  })

  it("adds 1, 2 or 3 points while tracking", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue({})
    render(
      <GameResultForm live game={makeGame({ result: { home: 10, away: 8 } })} onSave={onSave} />
    )

    await user.click(screen.getByTestId("game-result-home-add-2"))
    expect(onSave).toHaveBeenCalledWith({ home: 12, away: 8 })

    await user.click(screen.getByTestId("game-result-away-add-3"))
    expect(onSave).toHaveBeenCalledWith({ home: 10, away: 11 })
  })

  it("starts from zero when no result is saved yet", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue({})
    render(<GameResultForm live game={makeGame()} onSave={onSave} />)

    expect(screen.getByTestId("game-result-home-score")).toHaveTextContent("0")
    await user.click(screen.getByTestId("game-result-home-add-1"))
    expect(onSave).toHaveBeenCalledWith({ home: 1, away: 0 })
  })

  it("lets both scores be entered in one dialog", async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue({})
    render(<GameResultForm game={makeGame({ result: { home: 10, away: 8 } })} onSave={onSave} />)

    await user.click(screen.getByRole("button", { name: "Syötä tulos" }))
    const home = screen.getByTestId("game-result-dialog-home")
    const away = screen.getByTestId("game-result-dialog-away")
    await user.clear(home)
    await user.type(home, "64")
    await user.clear(away)
    await user.type(away, "58")
    await user.click(screen.getByTestId("game-result-dialog-save"))

    expect(onSave).toHaveBeenCalledWith({ home: 64, away: 58 })
  })
})
