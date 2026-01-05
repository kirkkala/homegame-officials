// API-based storage - data is stored in data/db.json via API routes

export type Game = {
  id: string
  divisionId: string
  opponent: string
  date: string
  time: string
  location: string
  officials: {
    poytakirja: string | null
    kello: string | null
  }
  createdAt: string
}

export type Player = {
  id: string
  name: string
  createdAt: string
}

// Games
export async function getGames(): Promise<Game[]> {
  const res = await fetch("/api/games")
  return res.json()
}

export async function saveGames(
  games: Omit<Game, "id" | "createdAt" | "officials">[]
): Promise<Game[]> {
  const res = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(games),
  })
  return res.json()
}

export async function clearAllGames(): Promise<void> {
  await fetch("/api/games", { method: "DELETE" })
}

export async function assignOfficial(
  gameId: string,
  role: "poytakirja" | "kello",
  playerName: string | null
): Promise<Game> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      officials: {
        [role]: playerName,
      },
    }),
  })
  return res.json()
}

// Players
export async function getPlayers(): Promise<Player[]> {
  const res = await fetch("/api/players")
  return res.json()
}

export async function savePlayer(name: string): Promise<Player> {
  const res = await fetch("/api/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return res.json()
}

export async function deletePlayer(id: string): Promise<void> {
  await fetch(`/api/players/${id}`, { method: "DELETE" })
}
