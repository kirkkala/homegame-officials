import { EMPTY_REBOUND_TRACKING } from "@/db/schema"
import {
  adjustReboundCount,
  formatReboundUpdatedAt,
  hasReboundCounts,
  normalizeRebounds,
  requireCounterToken,
  shortTeamName,
  toPublicRebounds,
} from "@/lib/rebounds"

const tracking = {
  ...EMPTY_REBOUND_TRACKING,
  counterName: "Timo",
  counterToken: "secret",
}

describe("rebounds", () => {
  it("shortens a slashed team name by dropping the last part", () => {
    expect(shortTeamName("HNMKY/Stadi")).toBe("HNMKY")
    expect(shortTeamName("Foo/Bar/Baz")).toBe("Foo/Bar")
    expect(shortTeamName("Helmi Basket")).toBe("Helmi Basket")
  })

  it("folds a legacy event log into the four counters", () => {
    expect(
      normalizeRebounds({
        counterName: "Timo",
        counterToken: "abc",
        events: [
          { basket: "home", winner: "home" },
          { basket: "home", winner: "home" },
          { basket: "home", winner: "away" },
          { basket: "away", winner: "home" },
          { basket: "away", winner: "away" },
          { basket: "away", winner: "away" },
        ],
      })
    ).toMatchObject({
      homeOff: 2,
      homeDef: 1,
      awayOff: 2,
      awayDef: 1,
      counterName: "Timo",
    })
  })

  it("strips the counter token from public rebounds", () => {
    expect(toPublicRebounds(tracking, "other")).toEqual({
      homeOff: 0,
      homeDef: 0,
      awayOff: 0,
      awayDef: 0,
      counterName: "Timo",
      updatedAt: null,
      counting: true,
      isCounter: false,
    })
    expect(toPublicRebounds(tracking, "secret").isCounter).toBe(true)
    expect(JSON.stringify(toPublicRebounds(tracking, "secret"))).not.toContain("secret")
  })

  it("requires the matching counter token", () => {
    expect(requireCounterToken(tracking, "secret")).toBeNull()
    expect(requireCounterToken(tracking, "nope")).toBe("Timo kirjaa tilastoa")
  })

  it("increments and decrements only the matching counter", () => {
    const added = adjustReboundCount(tracking, "home", "home", 1)
    expect(added.homeOff).toBe(1)
    expect(added.awayOff).toBe(0)
    expect(added.updatedAt).toEqual(expect.any(String))

    const removed = adjustReboundCount(added, "home", "home", -1)
    expect(removed.homeOff).toBe(0)
    expect(adjustReboundCount(tracking, "away", "home", -1).homeDef).toBe(0)
  })

  it("detects whether any rebounds were counted", () => {
    expect(hasReboundCounts(tracking)).toBe(false)
    expect(hasReboundCounts({ ...tracking, homeDef: 1 })).toBe(true)
  })

  it("formats the blob timestamp in Finnish", () => {
    expect(formatReboundUpdatedAt("2026-10-09T05:16:00.000Z")).toMatch(/9\.10\.2026 klo /)
  })
})
