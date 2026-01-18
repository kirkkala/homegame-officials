import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core"

// Officials assignment stored as JSON
export type OfficialAssignment = {
  playerName: string
  handledBy: "guardian" | "pool" | null
  confirmedBy: string | null
}

export type Officials = {
  poytakirja: OfficialAssignment | null
  kello: OfficialAssignment | null
}

// Teams
export const teams = pgTable("teams", {
  id: text("id").primaryKey(), // slug-based ID
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Users
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // UUID
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
)

// Sessions
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // UUID
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("sessions_token_idx").on(table.token)]
)

// Team managers (who can manage teams/games/players)
export const teamManagers = pgTable(
  "team_managers",
  {
    teamId: text("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.teamId, table.userId] })]
)

// Games
export const games = pgTable("games", {
  id: text("id").primaryKey(), // UUID
  teamId: text("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  divisionId: text("division_id").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  isHomeGame: boolean("is_home_game").notNull().default(false),
  date: text("date").notNull(), // ISO date string
  time: text("time").notNull(), // HH:mm format
  location: text("location").notNull(),
  officials: jsonb("officials")
    .$type<Officials>()
    .notNull()
    .default({ poytakirja: null, kello: null }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Players
export const players = pgTable("players", {
  id: text("id").primaryKey(), // UUID
  teamId: text("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Types for TypeScript
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type TeamManager = typeof teamManagers.$inferSelect
