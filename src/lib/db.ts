import { promises as fs } from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "db.json")

export type OfficialAssignment = {
  playerName: string
  handledBy: "guardian" | "pool" | null
  confirmedBy: string | null
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

export type DB = {
  teams: Team[]
  games: Game[]
  players: Player[]
}

export async function readDB(): Promise<DB> {
  try {
    const data = JSON.parse(await fs.readFile(DB_PATH, "utf-8"))
    // Ensure teams array exists for backward compatibility
    if (!data.teams) {
      data.teams = []
    }
    return data
  } catch {
    return { teams: [], games: [], players: [] }
  }
}

export async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
}
