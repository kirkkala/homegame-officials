import * as XLSX from "xlsx";
import type { Game } from "./storage";

export type ParsedGame = {
  division: string;
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  rawName: string;
};

/**
 * Parse Excel file and extract home games only
 * Home games are identified by "HNMKY/Stadi -" appearing in the game name
 */
export function parseExcelFile(file: ArrayBuffer): ParsedGame[] {
  const workbook = XLSX.read(file, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  const homeGames: ParsedGame[] = [];

  for (const row of data) {
    const name = row["Nimi"] || "";
    
    // Skip if not a home game (HNMKY/Stadi should be mentioned first)
    if (!name.includes("HNMKY/Stadi -")) {
      continue;
    }

    // Parse division from name (e.g., "I div.", "II div.", "III div.")
    const divMatch = name.match(/^(I{1,3})\s*div\./);
    const division = divMatch ? `${divMatch[1]} divisioona` : "Tuntematon";

    // Parse opponent (everything after "HNMKY/Stadi - ")
    const opponentMatch = name.match(/HNMKY\/Stadi\s*-\s*(.+)$/);
    const opponent = opponentMatch ? opponentMatch[1].trim() : "Tuntematon";

    // Parse date and time from "Alkaa" field (format: "10.01.2026 08:30:00")
    const startTime = row["Alkaa"] || "";
    const dateTimeMatch = startTime.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
    
    let date = "";
    let time = "";
    
    if (dateTimeMatch) {
      const [, day, month, year, hour, minute] = dateTimeMatch;
      date = `${year}-${month}-${day}`;
      time = `${hour}:${minute}`;
    }

    // Try to get actual game time from description (Kuvaus)
    // Format: "Lämppä: 08:30, Peli alkaa: 09:00"
    const description = row["Kuvaus"] || "";
    const gameTimeMatch = description.match(/Peli alkaa:\s*(\d{2}):(\d{2})/);
    if (gameTimeMatch) {
      time = `${gameTimeMatch[1]}:${gameTimeMatch[2]}`;
    }

    const location = row["Tapahtumapaikka"] || "";

    homeGames.push({
      division,
      opponent,
      date,
      time,
      location,
      rawName: name,
    });
  }

  // Sort by date
  homeGames.sort((a, b) => a.date.localeCompare(b.date));

  return homeGames;
}

/**
 * Convert parsed games to storage format
 */
export function convertToStorageFormat(
  parsedGames: ParsedGame[]
): Omit<Game, "id" | "createdAt" | "officials">[] {
  return parsedGames.map((game) => ({
    divisionId: game.division,
    opponent: game.opponent,
    date: game.date,
    time: game.time,
    location: game.location,
  }));
}

