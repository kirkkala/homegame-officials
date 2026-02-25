import { formatDate, slugify, computePlayerStats, computePlayerStatsArray } from "@/lib/utils"
import { makeGame } from "./helpers"

describe("utils", () => {
  it("slugify removes accents and normalizes whitespace", () => {
    expect(slugify("  AaBbCc & # ÅåÄäÖö (20€)")).toBe("aabbcc-aaaaoo-20")
  })

  it("formatDate returns Finnish weekday when requested", () => {
    expect(formatDate("2026-01-30T23:59:00", { includeWeekday: true })).toBe("Perjantai 30.1.2026")
    expect(formatDate("1980-04-12T08:36:25", { includeWeekday: true })).toBe("Lauantai 12.4.1980")
  })
})

describe("computePlayerStats", () => {
  it("returns empty map when no games", () => {
    const result = computePlayerStats([])
    expect(result.size).toBe(0)
  })

  it("returns empty map when no confirmed assignments", () => {
    const games = [
      makeGame({
        officials: {
          poytakirja: { playerName: "Matti", handledBy: null, confirmedBy: null },
          kello: { playerName: "Teppo", handledBy: null, confirmedBy: null },
        },
      }),
    ]
    const result = computePlayerStats(games)
    expect(result.size).toBe(0)
  })

  it("counts only confirmed guardian assignments", () => {
    const games = [
      makeGame({
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "guardian", confirmedBy: "Eeva" },
          kello: { playerName: "Teppo", handledBy: null, confirmedBy: null },
        },
      }),
    ]
    const result = computePlayerStats(games)
    expect(result.get("Matti")).toBe(1)
    expect(result.has("Teppo")).toBe(false)
  })

  it("counts only confirmed pool assignments", () => {
    const games = [
      makeGame({
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "pool", confirmedBy: null },
          kello: null,
        },
      }),
    ]
    const result = computePlayerStats(games)
    expect(result.get("Matti")).toBe(1)
  })

  it("counts both roles for the same player", () => {
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "guardian", confirmedBy: "Eeva" },
          kello: null,
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: null,
          kello: { playerName: "Matti", handledBy: "pool", confirmedBy: null },
        },
      }),
    ]
    const result = computePlayerStats(games)
    expect(result.get("Matti")).toBe(2)
  })

  it("counts multiple players across multiple games", () => {
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "guardian", confirmedBy: "Eeva" },
          kello: { playerName: "Teppo", handledBy: "guardian", confirmedBy: "Liisa" },
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "pool", confirmedBy: null },
          kello: { playerName: "Ville", handledBy: "guardian", confirmedBy: "Anna" },
        },
      }),
    ]
    const result = computePlayerStats(games)
    expect(result.get("Matti")).toBe(2)
    expect(result.get("Teppo")).toBe(1)
    expect(result.get("Ville")).toBe(1)
  })
})

describe("computePlayerStatsArray", () => {
  it("returns empty array when no games", () => {
    const result = computePlayerStatsArray([])
    expect(result).toEqual([])
  })

  it("sorts by count descending", () => {
    const games = [
      makeGame({
        id: "g1",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Teppo", handledBy: "guardian", confirmedBy: "L" },
        },
      }),
      makeGame({
        id: "g2",
        officials: {
          poytakirja: { playerName: "Matti", handledBy: "pool", confirmedBy: null },
          kello: null,
        },
      }),
    ]
    const result = computePlayerStatsArray(games)
    expect(result[0]).toEqual({ name: "Matti", count: 2 })
    expect(result[1]).toEqual({ name: "Teppo", count: 1 })
  })

  it("sorts alphabetically when counts are equal", () => {
    const games = [
      makeGame({
        officials: {
          poytakirja: { playerName: "Zorro", handledBy: "guardian", confirmedBy: "E" },
          kello: { playerName: "Aino", handledBy: "guardian", confirmedBy: "L" },
        },
      }),
    ]
    const result = computePlayerStatsArray(games)
    expect(result[0].name).toBe("Aino")
    expect(result[1].name).toBe("Zorro")
  })
})
