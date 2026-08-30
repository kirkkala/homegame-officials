/**
 * @vitest-environment node
 */

import { readFile } from "node:fs/promises"
import path from "node:path"
import { isClubHomeGame, parseExcelFile } from "@/lib/excel-parser"

const toArrayBuffer = (buffer: Buffer): ArrayBuffer =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer

async function parseGamesFromRows(rows: Record<string, unknown>[]) {
  const XLSX = await import("xlsx")
  const sheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1")
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
  return parseExcelFile(toArrayBuffer(buffer))
}

describe("isClubHomeGame", () => {
  it("is true when the home team starts with HNMKY", () => {
    expect(isClubHomeGame("HNMKY")).toBe(true)
    expect(isClubHomeGame("HNMKY T14 Stadi")).toBe(true)
    expect(isClubHomeGame("hnmky t13")).toBe(true)
  })

  it("is false when the home team is another club", () => {
    expect(isClubHomeGame("KlaNMKY")).toBe(false)
    expect(isClubHomeGame("ToPo")).toBe(false)
    expect(isClubHomeGame("")).toBe(false)
  })
})

describe("excel-parser", () => {
  it("parses elsa-myclub-import.xlsx into games", async () => {
    const filePath = path.join(process.cwd(), "excel-test-sheets", "elsa-myclub-import.xlsx")
    const fileBuffer = await readFile(filePath)
    const games = await parseExcelFile(toArrayBuffer(fileBuffer))

    expect(games.length).toBeGreaterThan(0)
    expect(games.some((game) => game.homeTeam && game.awayTeam)).toBe(true)
    expect(games.some((game) => game.date && game.time)).toBe(true)
    expect(games.every((game) => typeof game.rawName === "string")).toBe(true)
    expect(games.filter((game) => game.isHomeGame).length).toBeGreaterThan(0)
    expect(games.every((game) => game.isHomeGame === isClubHomeGame(game.homeTeam))).toBe(true)
  })

  it("marks games as home games when the listed home team starts with HNMKY", async () => {
    const games = await parseGamesFromRows([
      {
        Nimi: "I div. HNMKY T14 Stadi - KlaNMKY",
        Alkaa: "10.01.2026 08:30:00",
        Kuvaus: "Lämppä: 08:30, Peli alkaa: 09:00",
        Tapahtumapaikka: "Halli 1",
      },
      {
        Nimi: "II div. ToPo - HNMKY T14 Stadi",
        Alkaa: "11.01.2026 18:00:00",
        Tapahtumapaikka: "Halli 2",
      },
    ])

    expect(games).toHaveLength(2)
    expect(games[0]).toMatchObject({
      homeTeam: "HNMKY T14 Stadi",
      awayTeam: "KlaNMKY",
      isHomeGame: true,
    })
    expect(games[1]).toMatchObject({
      homeTeam: "ToPo",
      awayTeam: "HNMKY T14 Stadi",
      isHomeGame: false,
    })
  })
})
