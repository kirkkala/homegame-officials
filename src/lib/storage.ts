// API-based storage - data is stored in Postgres via API routes

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

export type User = {
  id: string
  email: string
}

// Helper to safely parse JSON response
async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    let error = "Pyyntö epäonnistui"
    try {
      const data = JSON.parse(text)
      error = data.error || error
    } catch {
      // Couldn't parse error message
    }
    throw new Error(error)
  }
  return res.json()
}

// Teams
export async function getTeams(): Promise<Team[]> {
  const res = await fetch("/api/teams")
  return parseJsonResponse<Team[]>(res)
}

export async function getManagedTeams(): Promise<Team[]> {
  const res = await fetch("/api/teams/managed")
  return parseJsonResponse<Team[]>(res)
}

export async function createTeam(name: string): Promise<Team> {
  const res = await fetch("/api/teams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  return parseJsonResponse<Team>(res)
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, { method: "DELETE" })
  if (!res.ok) {
    throw new Error("Joukkueen poisto epäonnistui")
  }
}

// Team managers
export async function getTeamManagers(teamId: string): Promise<{ id: string; email: string }[]> {
  const res = await fetch(`/api/teams/${teamId}/managers`)
  return parseJsonResponse<{ id: string; email: string }[]>(res)
}

export async function addTeamManager(teamId: string, email: string): Promise<void> {
  const res = await fetch(`/api/teams/${teamId}/managers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Käyttäjän lisääminen epäonnistui")
  }
}

export async function removeTeamManager(teamId: string, email: string): Promise<void> {
  const res = await fetch(`/api/teams/${teamId}/managers`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Käyttäjän poisto epäonnistui")
  }
}

// Users (admin-only)
export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users")
  return parseJsonResponse<User[]>(res)
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
  return parseJsonResponse<Game[]>(res)
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
  return parseJsonResponse<Game[]>(res)
}

export async function clearAllGames(teamId?: string): Promise<void> {
  const url = teamId ? `/api/games?teamId=${teamId}` : "/api/games"
  const res = await fetch(url, { method: "DELETE" })
  if (!res.ok) {
    throw new Error("Otteluiden poisto epäonnistui")
  }
}

export async function updateOfficial(
  gameId: string,
  teamId: string,
  role: "poytakirja" | "kello",
  assignment: OfficialAssignment | null
): Promise<Game> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officials: { [role]: assignment }, teamId }),
  })
  return parseJsonResponse<Game>(res)
}

export async function updateGameHomeStatus(gameId: string, isHomeGame: boolean): Promise<Game> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isHomeGame }),
  })
  return parseJsonResponse<Game>(res)
}

export async function updateGameDetails(
  gameId: string,
  updates: Pick<Game, "divisionId" | "homeTeam" | "awayTeam" | "date" | "time" | "location">
): Promise<Game> {
  const res = await fetch(`/api/games/${gameId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
  return parseJsonResponse<Game>(res)
}

export async function deleteGame(gameId: string): Promise<void> {
  const res = await fetch(`/api/games/${gameId}`, { method: "DELETE" })
  if (!res.ok) {
    throw new Error("Ottelun poisto epäonnistui")
  }
}

// Players
export async function getPlayers(teamId?: string): Promise<Player[]> {
  const url = teamId ? `/api/players?teamId=${teamId}` : "/api/players"
  const res = await fetch(url)
  return parseJsonResponse<Player[]>(res)
}

export async function savePlayer(name: string, teamId: string): Promise<Player> {
  const res = await fetch("/api/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, teamId }),
  })
  return parseJsonResponse<Player>(res)
}

export async function deletePlayer(id: string): Promise<void> {
  const res = await fetch(`/api/players/${id}`, { method: "DELETE" })
  if (!res.ok) {
    throw new Error("Pelaajan poisto epäonnistui")
  }
}
