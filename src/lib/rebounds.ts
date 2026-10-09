import { EMPTY_REBOUND_TRACKING, type ReboundSide, type ReboundTracking } from "@/db/schema"

export type PublicReboundTracking = {
  homeOff: number
  homeDef: number
  awayOff: number
  awayDef: number
  counterName: string | null
  updatedAt: string | null
  counting: boolean
  isCounter: boolean
}

export type ReboundCountKey = "homeOff" | "homeDef" | "awayOff" | "awayDef"

type StoredRebounds = Partial<ReboundTracking> & {
  events?: { basket: ReboundSide; winner: ReboundSide }[]
}

export function reboundCountKey(basket: ReboundSide, winner: ReboundSide): ReboundCountKey {
  if (winner === "home") return basket === "home" ? "homeOff" : "homeDef"
  return basket === "away" ? "awayOff" : "awayDef"
}

function countsFromEvents(events: { basket: ReboundSide; winner: ReboundSide }[]) {
  const counts = { homeOff: 0, homeDef: 0, awayOff: 0, awayDef: 0 }
  for (const event of events) {
    counts[reboundCountKey(event.basket, event.winner)] += 1
  }
  return counts
}

export function normalizeRebounds(value: StoredRebounds | null | undefined): ReboundTracking {
  const counts =
    typeof value?.homeOff === "number"
      ? {
          homeOff: value.homeOff ?? 0,
          homeDef: value.homeDef ?? 0,
          awayOff: value.awayOff ?? 0,
          awayDef: value.awayDef ?? 0,
        }
      : countsFromEvents(Array.isArray(value?.events) ? value.events : [])

  return {
    ...EMPTY_REBOUND_TRACKING,
    ...counts,
    counterName: value?.counterName ?? null,
    counterToken: value?.counterToken ?? null,
    updatedAt: value?.updatedAt ?? null,
  }
}

export function toPublicRebounds(
  tracking: StoredRebounds | null | undefined,
  token?: string | null
): PublicReboundTracking {
  const normalized = normalizeRebounds(tracking)
  return {
    homeOff: normalized.homeOff,
    homeDef: normalized.homeDef,
    awayOff: normalized.awayOff,
    awayDef: normalized.awayDef,
    counterName: normalized.counterName,
    updatedAt: normalized.updatedAt,
    counting: Boolean(normalized.counterToken),
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

export function hasReboundCounts(
  rebounds: PublicReboundTracking | ReboundTracking | null | undefined
) {
  if (!rebounds) return false
  return rebounds.homeOff + rebounds.homeDef + rebounds.awayOff + rebounds.awayDef > 0
}

export function adjustReboundCount(
  tracking: ReboundTracking,
  basket: ReboundSide,
  winner: ReboundSide,
  delta: 1 | -1
): ReboundTracking {
  const key = reboundCountKey(basket, winner)
  return {
    ...tracking,
    [key]: Math.max(0, tracking[key] + delta),
    updatedAt: new Date().toISOString(),
  }
}

export function touchRebounds(
  tracking: ReboundTracking,
  extra: Partial<ReboundTracking> = {}
): ReboundTracking {
  return { ...tracking, ...extra, updatedAt: new Date().toISOString() }
}

/** "HNMKY/Stadi" → "HNMKY". Compact scoreboard and rebound pad labels. */
export function shortTeamName(name: string): string {
  const slash = name.lastIndexOf("/")
  if (slash <= 0) return name
  const shortened = name.slice(0, slash).trim()
  return shortened || name
}

export function requireCounterToken(
  tracking: ReboundTracking,
  token: string | undefined
): string | null {
  if (!tracking.counterToken || !tracking.counterName) {
    return "Kukaan ei tilastoi tällä hetkellä"
  }
  if (!token || token !== tracking.counterToken) {
    return `${tracking.counterName} kirjaa tilastoa`
  }
  return null
}

export function formatReboundUpdatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const time = `${date.getHours()}.${String(date.getMinutes()).padStart(2, "0")}`
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} klo ${time}`
}
