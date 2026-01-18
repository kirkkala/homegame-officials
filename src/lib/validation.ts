import { z } from "zod/v4"

// Shared string constraints
const nameString = z.string().min(1).max(100).trim()
const idString = z.string().min(1).max(100)
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
const timeString = z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)")
const emailString = z
  .string()
  .email()
  .max(255)
  .transform((value) => value.trim().toLowerCase())

// Team schemas
export const createTeamSchema = z.object({
  name: nameString,
})

// Player schemas
export const createPlayerSchema = z.object({
  name: nameString,
  teamId: idString,
})

// Official assignment schema
const officialAssignmentSchema = z
  .object({
    playerName: nameString,
    handledBy: z.enum(["guardian", "pool"]).nullable(),
    confirmedBy: z.string().max(100).nullable(),
  })
  .nullable()

// Game schemas
export const createGameSchema = z.object({
  divisionId: z.string().max(50).default(""),
  homeTeam: nameString,
  awayTeam: nameString,
  isHomeGame: z.boolean(),
  date: dateString,
  time: timeString,
  location: z.string().max(200).default(""),
})

export const createGamesSchema = z.object({
  games: z.array(createGameSchema).min(1).max(500),
  teamId: idString,
})

export const updateGameSchema = z.object({
  officials: z
    .object({
      poytakirja: officialAssignmentSchema.optional(),
      kello: officialAssignmentSchema.optional(),
    })
    .optional(),
  isHomeGame: z.boolean().optional(),
})

export const teamManagerSchema = z.object({
  email: emailString,
})

// Helper to validate and return parsed data or error response
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = z.prettifyError(result.error)
  return { success: false, error: errors }
}
