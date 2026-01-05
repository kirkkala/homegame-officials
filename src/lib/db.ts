import { promises as fs } from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "data", "db.json")

export type OfficialAssignment = {
  playerName: string
  handledBy: "guardian" | "pool" | null
  confirmedBy: string | null
}

export type Game = {
  id: string
  divisionId: string
  opponent: string
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
  name: string
  createdAt: string
}

export type DB = {
  games: Game[]
  players: Player[]
}

export async function readDB(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, "utf-8"))
  } catch {
    return { games: [], players: [] }
  }
}

export async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
}
