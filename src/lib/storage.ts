// API-based storage - data is stored in data/db.json via API routes

export type OfficialAssignment = {
  playerName: string // Player whose turn it is
  handledBy: "guardian" | "pool" | null // Who handles the shift
  confirmedBy: string | null // Name (required for guardian, optional for pool)
}

export type Team = {
  id: string
  name: string
  createdAt: string
}

export type Game = {
  id: string
  teamId: string
  divisionId: string
  homeTeam: string
  awayTeam: string
  isHomeGame: boolean
  date: string
  time: string
  location: string
  officials: {
    poytakirja: OfficialAssignment | null
    kello: OfficialAssignment | null
  }
  createdAt: string
}

export type Player = {
  id: string
  teamId: string
  name: string
  createdAt: string
}

// Teams
export async function getTeams(): Promise<Team[]> {
  const res = await fetch("/api/teams")
  return res.json()
}

export async function createTeam(name: string): Promise<Team> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return res.json()
}

export async function deleteTeam(id: string): Promise<void> {
  await fetch(`/api/teams/${id}`, { method: "DELETE" })
}

// Selected team (localStorage for persistence)
const SELECTED_TEAM_KEY = "selectedTeamId"

export function getSelectedTeamId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(SELECTED_TEAM_KEY)
}

export function setSelectedTeamId(teamId: string | null): void {
  if (typeof window === "undefined") return
  if (teamId) {
    localStorage.setItem(SELECTED_TEAM_KEY, teamId)
  } else {
    localStorage.removeItem(SELECTED_TEAM_KEY)
  }
}

// Games
export async function getGames(teamId?: string): Promise<Game[]> {
  const url = teamId ? `/api/games?teamId=${teamId}` : "/api/games"
  const res = await fetch(url)
  return res.json()
}

export async function saveGames(
  games: Omit<Game, "id" | "createdAt" | "officials" | "teamId">[],
  teamId: string
): Promise<Game[]> {
  const res = await fetch("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ games, teamId }),
  })
  return res.json()
}

export async function clearAllGames(teamId?: string): Promise<void> {
  const url = teamId ? `/api/games?teamId=${teamId}` : "/api/games"
  await fetch(url, { method: "DELETE" })
}

export async function updateOfficial(
  gameId: string,
  role: "poytakirja" | "kello",
  assignment: OfficialAssignment | null
): Promise<Game> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officials: { [role]: assignment } }),
  })
  return res.json()
}

export async function updateGameHomeStatus(gameId: string, isHomeGame: boolean): Promise<Game> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isHomeGame }),
  })
  return res.json()
}

export async function deleteGame(gameId: string): Promise<void> {
  await fetch(`/api/games/${gameId}`, { method: "DELETE" })
}

// Players
export async function getPlayers(teamId?: string): Promise<Player[]> {
  const url = teamId ? `/api/players?teamId=${teamId}` : "/api/players"
  const res = await fetch(url)
  return res.json()
}

export async function savePlayer(name: string, teamId: string): Promise<Player> {
  const res = await fetch("/api/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, teamId }),
  })
  return res.json()
}

export async function deletePlayer(id: string): Promise<void> {
  await fetch(`/api/players/${id}`, { method: "DELETE" })
}
