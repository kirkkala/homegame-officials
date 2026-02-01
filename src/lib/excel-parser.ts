import * as XLSX from "xlsx"

export type ParsedGame = {
  division: string
  homeTeam: string
  awayTeam: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  location: string
  rawName: string
  isHomeGame: boolean // User will mark this in the UI
}

/**
 * Parse Excel file and extract all games
 * Games are expected to have format like "I div. Team A - Team B"
 */
function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

function parseExcelDateTime(value: unknown): { date: string; time: string } | null {
  if (typeof value === "string") {
    const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/)
    if (match) {
      const [, day, month, year, hour, minute] = match
      return {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}`,
      }
    }
  }

  if (value instanceof Date) {
    return {
      date: `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`,
      time: `${pad2(value.getHours())}:${pad2(value.getMinutes())}`,
    }
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return {
        date: `${parsed.y}-${pad2(parsed.m)}-${pad2(parsed.d)}`,
        time: `${pad2(parsed.H || 0)}:${pad2(parsed.M || 0)}`,
      }
    }
  }

  return null
}

export function parseExcelFile(file: ArrayBuffer): ParsedGame[] {
  const workbook = XLSX.read(file, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  const games: ParsedGame[] = []

  for (const row of data) {
    const name = typeof row["Nimi"] === "string" ? row["Nimi"] : ""

    // Skip rows without a game name or without the " - " separator (not a game)
    if (!name || !name.includes(" - ")) {
      continue
    }

    // Parse division from name (e.g., "I div.", "II div.", "III div.")
    const divMatch = name.match(/^(I{1,3}\s*div\.)/)
    const division = divMatch ? divMatch[1] : ""

    // Parse teams from name
    // Format: "I div. Team A - Team B" or just "Team A - Team B"
    let teamsString = name
    if (divMatch) {
      teamsString = name.replace(/^I{1,3}\s*div\.\s*/, "")
    }

    const teamsParts = teamsString.split(" - ")
    if (teamsParts.length < 2) continue

    const homeTeam = teamsParts[0].trim()
    const awayTeam = teamsParts.slice(1).join(" - ").trim() // Handle team names with " - " in them

    // Parse date and time from "Alkaa" field (format: "10.01.2026 08:30:00")
    let date = ""
    let time = ""
    const parsedDateTime = parseExcelDateTime(row["Alkaa"])
    if (parsedDateTime) {
      date = parsedDateTime.date
      time = parsedDateTime.time
    }

    // Try to get actual game time from description (Kuvaus)
    // Format: "Lämppä: 08:30, Peli alkaa: 09:00"
    const description = typeof row["Kuvaus"] === "string" ? row["Kuvaus"] : ""
    if (description) {
      const gameTimeMatch = description.match(/Peli alkaa:\s*(\d{2}):(\d{2})/)
      if (gameTimeMatch) {
        time = `${gameTimeMatch[1]}:${gameTimeMatch[2]}`
      }
    }

    const location = typeof row["Tapahtumapaikka"] === "string" ? row["Tapahtumapaikka"] : ""

    games.push({
      division,
      homeTeam,
      awayTeam,
      date,
      time,
      location,
      rawName: name,
      isHomeGame: false, // User will mark this in preview
    })
  }

  // Sort by date
  games.sort((a, b) => a.date.localeCompare(b.date))

  return games
}
