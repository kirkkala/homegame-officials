import type { ReboundEvent } from "@/db/schema"
import {
  computeReboundStats,
  requireCounterToken,
  shortTeamName,
  toPublicRebounds,
} from "@/lib/rebounds"

const event = (
  basket: ReboundEvent["basket"],
  winner: ReboundEvent["winner"],
  id: string
): ReboundEvent => ({
  id,
  basket,
  winner,
  createdAt: "2026-10-07T18:00:00.000Z",
})

describe("rebounds", () => {
  it("shortens a slashed team name by dropping the last part", () => {
    expect(shortTeamName("HNMKY/Stadi")).toBe("HNMKY")
    expect(shortTeamName("Foo/Bar/Baz")).toBe("Foo/Bar")
    expect(shortTeamName("Helmi Basket")).toBe("Helmi Basket")
  })

  it("counts own and opponent basket won/lost for both teams", () => {
    const events = [
      event("home", "home", "1"),
      event("home", "home", "2"),
      event("home", "away", "3"),
      event("away", "home", "4"),
      event("away", "away", "5"),
      event("away", "away", "6"),
    ]
    expect(computeReboundStats(events).home).toEqual({
      ownWon: 2,
      ownLost: 1,
      oppWon: 1,
      oppLost: 2,
      total: 3,
    })
  })

  it("treats the two teams as complements of each other", () => {
    const events = [
      event("home", "home", "1"),
      event("away", "away", "2"),
      event("home", "away", "3"),
    ]
    const stats = computeReboundStats(events)
    expect(stats.home.ownWon).toBe(stats.away.oppLost)
    expect(stats.home.ownLost).toBe(stats.away.oppWon)
    expect(stats.home.oppWon).toBe(stats.away.ownLost)
    expect(stats.home.oppLost).toBe(stats.away.ownWon)
  })

  it("strips the counter token from public rebounds", () => {
    expect(
      toPublicRebounds({ counterName: "Timo", counterToken: "secret", events: [] }, "other")
    ).toEqual({
      counterName: "Timo",
      events: [],
      isCounter: false,
    })
    expect(
      toPublicRebounds({ counterName: "Timo", counterToken: "secret", events: [] }, "secret")
        .isCounter
    ).toBe(true)
  })

  it("requires the matching counter token", () => {
    const tracking = { counterName: "Timo", counterToken: "abc", events: [] }
    expect(requireCounterToken(tracking, "abc")).toBeNull()
    expect(requireCounterToken(tracking, "nope")).toBe("Timo kirjaa levypalloja")
  })
})
