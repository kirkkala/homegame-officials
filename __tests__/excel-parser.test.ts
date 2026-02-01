/**
 * @jest-environment node
 */

import { readFile } from "node:fs/promises"
import path from "node:path"
import { parseExcelFile } from "@/lib/excel-parser"

const toArrayBuffer = (buffer: Buffer) =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

describe("excel parser with real file", () => {
  it("parses elsa-myclub-import.xlsx into games", async () => {
    const filePath = path.join(process.cwd(), "excel-test-sheets", "elsa-myclub-import.xlsx")
    const fileBuffer = await readFile(filePath)
    const games = parseExcelFile(toArrayBuffer(fileBuffer))

    expect(games.length).toBeGreaterThan(0)
    expect(games.some((game) => game.homeTeam && game.awayTeam)).toBe(true)
    expect(games.some((game) => game.date && game.time)).toBe(true)
    expect(games.every((game) => typeof game.rawName === "string")).toBe(true)
  })
})
