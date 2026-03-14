import type { Game, Player } from "@/lib/storage"

export const makeGame = (overrides: Partial<Game> = {}): Game => ({
  id: "game-1",
  teamId: "team-1",
  divisionId: "II Div.",
  homeTeam: "Home Team",
  awayTeam: "Away Team",
  isHomeGame: true,
  date: "2025-01-30",
  time: "18:30",
  location: "Halli 1",
  officials: { poytakirja: null, kello: null },
  createdAt: "2025-01-01T00:00:00Z",
  ...overrides,
})

export const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: "player-1",
  teamId: "team-1",
  name: "Test Player",
  createdAt: "2025-01-01T00:00:00Z",
  ...overrides,
})
