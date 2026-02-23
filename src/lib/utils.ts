import type { Game } from "./storage"

/**
 * Converts a string to a URL-safe slug for use as an ID.
 * Uses Unicode normalization to handle all accented characters.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatDate(dateStr: string, options: { includeWeekday?: boolean } = {}): string {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  if (!options.includeWeekday) return `${day}.${month}.${year}`

  const weekdays = [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai",
  ]
  return `${weekdays[date.getDay()]} ${day}.${month}.${year}`
}

/**
 * Computes confirmed shift counts per player from a list of games.
 * Only counts assignments where handledBy is set ("guardian" or "pool").
 */
export function computePlayerStats(games: Game[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const game of games) {
    const poytakirja = game.officials.poytakirja
    const kello = game.officials.kello

    if (poytakirja?.playerName && poytakirja.handledBy) {
      counts.set(poytakirja.playerName, (counts.get(poytakirja.playerName) || 0) + 1)
    }
    if (kello?.playerName && kello.handledBy) {
      counts.set(kello.playerName, (counts.get(kello.playerName) || 0) + 1)
    }
  }

  return counts
}

/**
 * Returns player stats as a sorted array for display (highest count first).
 */
export function computePlayerStatsArray(games: Game[]): { name: string; count: number }[] {
  const counts = computePlayerStats(games)
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fi"))
}
