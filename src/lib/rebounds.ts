import type { ReboundEvent, ReboundSide, ReboundTracking } from "@/db/schema"

export type PublicReboundTracking = {
  counterName: string | null
  events: ReboundEvent[]
  isCounter: boolean
}

export type TeamReboundStats = {
  ownWon: number
  ownLost: number
  oppWon: number
  oppLost: number
  total: number
}

export function normalizeRebounds(value: ReboundTracking | null | undefined): ReboundTracking {
  return {
    counterName: value?.counterName ?? null,
    counterToken: value?.counterToken ?? null,
    events: Array.isArray(value?.events) ? value.events : [],
  }
}

export function toPublicRebounds(
  tracking: ReboundTracking | null | undefined,
  token?: string | null
): PublicReboundTracking {
  const normalized = normalizeRebounds(tracking)
  return {
    counterName: normalized.counterName,
    events: normalized.events,
    isCounter: Boolean(token && normalized.counterToken && token === normalized.counterToken),
  }
}

export function toPublicGame<T extends { rebounds?: ReboundTracking | null }>(
  game: T,
  token?: string | null
): Omit<T, "rebounds"> & { rebounds: PublicReboundTracking } {
  const { rebounds, ...rest } = game
  return {
    ...rest,
    rebounds: toPublicRebounds(rebounds, token),
  }
}

function statsForSide(events: ReboundEvent[], side: ReboundSide): TeamReboundStats {
  const opp: ReboundSide = side === "home" ? "away" : "home"
  const ownWon = events.filter((e) => e.basket === side && e.winner === side).length
  const ownLost = events.filter((e) => e.basket === side && e.winner === opp).length
  const oppWon = events.filter((e) => e.basket === opp && e.winner === side).length
  const oppLost = events.filter((e) => e.basket === opp && e.winner === opp).length
  return {
    ownWon,
    ownLost,
    oppWon,
    oppLost,
    total: ownWon + oppWon,
  }
}

/** "HNMKY/Stadi" → "HNMKY". Used only on compact rebound labels. */
export function shortTeamName(name: string): string {
  const slash = name.lastIndexOf("/")
  if (slash <= 0) return name
  const shortened = name.slice(0, slash).trim()
  return shortened || name
}

export function computeReboundStats(events: ReboundEvent[]) {
  return {
    home: statsForSide(events, "home"),
    away: statsForSide(events, "away"),
  }
}

export function requireCounterToken(
  tracking: ReboundTracking,
  token: string | undefined
): string | null {
  if (!tracking.counterToken || !tracking.counterName) {
    return "Kukaan ei kirjaa levypalloja tällä hetkellä"
  }
  if (!token || token !== tracking.counterToken) {
    return `${tracking.counterName} kirjaa levypalloja`
  }
  return null
}
