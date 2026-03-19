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

/** Format variants for Finnish date display. */
export type DateFormat = "full" | "short" | "weekday"

/**
 * Formats a date string in Finnish locale.
 *
 * @param dateStr - ISO date string (e.g. "2026-01-30T23:59:00")
 * @param options.format - `"full"` = day.month.year, `"short"` = day.month., `"weekday"` = weekday day.month.year
 * @returns Formatted date string
 */
export function formatDate(dateStr: string, options: { format?: DateFormat } = {}): string {
  const { format = "full" } = options
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  if (format === "short") return `${day}.${month}.`
  if (format === "weekday") {
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
  return `${day}.${month}.${year}`
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
 * When `rosterNames` is set, every roster name is included with count 0 if they have no confirmed shifts yet.
 */
export function computePlayerStatsArray(
  games: Game[],
  rosterNames?: string[]
): { name: string; count: number }[] {
  const counts = computePlayerStats(games)
  if (rosterNames?.length) {
    for (const raw of rosterNames) {
      const name = raw.trim()
      if (!name || counts.has(name)) continue
      counts.set(name, 0)
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort(
      (playerA, playerB) =>
        playerB.count - playerA.count || playerA.name.localeCompare(playerB.name, "fi")
    )
}
