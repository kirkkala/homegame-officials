import { pgTable, serial, text, timestamp, integer, date, time } from "drizzle-orm/pg-core";

// Pelaajat / Players (parents are identified by player name)
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Pelaajan nimi
  parentName: text("parent_name"), // Vanhemman nimi (valinnainen)
  phone: text("phone"), // Puhelinnumero
  email: text("email"), // Sähköposti
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sarjat / Divisions
export const divisions = pgTable("divisions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // esim. "U12", "U14", "U16"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Kotipelit / Home games
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  divisionId: integer("division_id")
    .references(() => divisions.id)
    .notNull(),
  opponent: text("opponent").notNull(), // Vastustaja
  gameDate: date("game_date").notNull(), // Pelin päivämäärä
  gameTime: time("game_time").notNull(), // Pelin alkamisaika
  location: text("location"), // Pelipaikka
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Toimitsijat / Game officials assignments
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .references(() => games.id)
    .notNull(),
  playerId: integer("player_id")
    .references(() => players.id)
    .notNull(),
  role: text("role").notNull(), // "pöytäkirja" tai "kello"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types for TypeScript
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Division = typeof divisions.$inferSelect;
export type NewDivision = typeof divisions.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

