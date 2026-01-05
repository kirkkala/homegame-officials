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
export function parseExcelFile(file: ArrayBuffer): ParsedGame[] {
  const workbook = XLSX.read(file, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)

  const games: ParsedGame[] = []

  for (const row of data) {
    const name = row["Nimi"] || ""

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
    const startTime = row["Alkaa"] || ""
    const dateTimeMatch = startTime.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/)

    let date = ""
    let time = ""

    if (dateTimeMatch) {
      const [, day, month, year, hour, minute] = dateTimeMatch
      date = `${year}-${month}-${day}`
      time = `${hour}:${minute}`
    }

    // Try to get actual game time from description (Kuvaus)
    // Format: "Lämppä: 08:30, Peli alkaa: 09:00"
    const description = row["Kuvaus"] || ""
    const gameTimeMatch = description.match(/Peli alkaa:\s*(\d{2}):(\d{2})/)
    if (gameTimeMatch) {
      time = `${gameTimeMatch[1]}:${gameTimeMatch[2]}`
    }

    const location = row["Tapahtumapaikka"] || ""

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
