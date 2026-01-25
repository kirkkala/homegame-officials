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
