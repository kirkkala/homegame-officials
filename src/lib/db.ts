import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { sql } from "@vercel/postgres"
import { Pool } from "pg"
import { eq } from "drizzle-orm"
import * as schema from "@/db/schema"

// Use @vercel/postgres on Vercel, pg locally
const isVercel = process.env.VERCEL === "1"

function createDb() {
  if (isVercel) {
    return drizzleVercel(sql, { schema })
  } else {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    })
    return drizzlePg(pool, { schema })
  }
}

export const db = createDb()

// Re-export types from schema
export type { Team, Game, Player, OfficialAssignment, Officials } from "@/db/schema"

// ============ TEAMS ============

export async function getTeams() {
  return db.select().from(schema.teams).orderBy(schema.teams.name)
}

export async function getTeamById(id: string) {
  const result = await db.select().from(schema.teams).where(eq(schema.teams.id, id))
  return result[0] || null
}

export async function createTeam(id: string, name: string) {
  const result = await db.insert(schema.teams).values({ id, name }).returning()
  return result[0]
}

export async function deleteTeam(id: string) {
  // Games and players are deleted via cascade
  await db.delete(schema.teams).where(eq(schema.teams.id, id))
}

// ============ GAMES ============

export async function getGames(teamId?: string) {
  if (teamId) {
    return db
      .select()
      .from(schema.games)
      .where(eq(schema.games.teamId, teamId))
      .orderBy(schema.games.date, schema.games.time)
  }
  return db.select().from(schema.games).orderBy(schema.games.date, schema.games.time)
}

export async function getGameById(id: string) {
  const result = await db.select().from(schema.games).where(eq(schema.games.id, id))
  return result[0] || null
}

export async function createGames(games: Omit<schema.NewGame, "createdAt">[], teamId: string) {
  if (games.length === 0) return []

  // Get existing games to check for duplicates
  const existingGames = await db.select().from(schema.games).where(eq(schema.games.teamId, teamId))

  const newGames = games.filter(
    (game) =>
      !existingGames.some(
        (g) =>
          g.date === game.date &&
          g.time === game.time &&
          g.homeTeam === game.homeTeam &&
          g.awayTeam === game.awayTeam
      )
  )

  if (newGames.length === 0) return []

  const result = await db
    .insert(schema.games)
    .values(
      newGames.map((game) => ({
        ...game,
        teamId,
        officials: game.officials || { poytakirja: null, kello: null },
      }))
    )
    .returning()

  return result
}

export async function updateGame(
  id: string,
  updates: {
    officials?: Partial<schema.Officials>
    isHomeGame?: boolean
  }
) {
  const game = await getGameById(id)
  if (!game) return null

  const updateData: Partial<schema.Game> = {}

  if (updates.officials !== undefined) {
    updateData.officials = {
      poytakirja:
        updates.officials.poytakirja !== undefined
          ? updates.officials.poytakirja
          : game.officials.poytakirja,
      kello: updates.officials.kello !== undefined ? updates.officials.kello : game.officials.kello,
    }
  }

  if (updates.isHomeGame !== undefined) {
    updateData.isHomeGame = updates.isHomeGame
  }

  const result = await db
    .update(schema.games)
    .set(updateData)
    .where(eq(schema.games.id, id))
    .returning()

  return result[0]
}

export async function deleteGame(id: string) {
  await db.delete(schema.games).where(eq(schema.games.id, id))
}

export async function deleteGamesByTeam(teamId: string) {
  await db.delete(schema.games).where(eq(schema.games.teamId, teamId))
}

export async function deleteAllGames() {
  await db.delete(schema.games)
}

// ============ PLAYERS ============

export async function getPlayers(teamId?: string) {
  if (teamId) {
    return db
      .select()
      .from(schema.players)
      .where(eq(schema.players.teamId, teamId))
      .orderBy(schema.players.name)
  }
  return db.select().from(schema.players).orderBy(schema.players.name)
}

export async function getPlayerById(id: string) {
  const result = await db.select().from(schema.players).where(eq(schema.players.id, id))
  return result[0] || null
}

export async function createPlayer(id: string, name: string, teamId: string) {
  const result = await db.insert(schema.players).values({ id, name, teamId }).returning()
  return result[0]
}

export async function deletePlayer(id: string) {
  await db.delete(schema.players).where(eq(schema.players.id, id))
}
