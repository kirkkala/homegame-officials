export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
  const months = ["tammi", "helmi", "maalis", "huhti", "touko", "kesä", "heinä", "elo", "syys", "loka", "marras", "joulu"];
  return `${weekdays[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}
