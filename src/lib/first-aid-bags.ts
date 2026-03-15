// Client-side storage for first aid bag tracking (no DB yet)
// Data is keyed by team ID so each team has their own bag tracking

export type BagHolder = {
  name: string
  lastSeenAt: string // ISO date string, when the holder was recorded
}

export type FirstAidBagsData = Record<string, BagHolder | null>

/** @TODO: Replace value with admin configuration */
export function getBagCountForTeam(_teamId: string): number {
  return 3
}

const STORAGE_PREFIX = "firstAidBags_"

function getStorageKey(teamId: string): string {
  return `${STORAGE_PREFIX}${teamId}`
}

function emptyBagsData(bagCount: number): FirstAidBagsData {
  const data: FirstAidBagsData = {}
  for (let i = 1; i <= bagCount; i++) {
    data[`bag${i}`] = null
  }
  return data
}

export function getFirstAidBags(teamId: string): FirstAidBagsData {
  const bagCount = getBagCountForTeam(teamId)
  if (typeof window === "undefined") {
    return emptyBagsData(bagCount)
  }
  try {
    const raw = localStorage.getItem(getStorageKey(teamId))
    if (!raw) return emptyBagsData(bagCount)
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result: FirstAidBagsData = {}
    for (let i = 1; i <= bagCount; i++) {
      const key = `bag${i}`
      const val = parsed[key]
      const hasDate =
        val && typeof val === "object" && "name" in val && ("lastSeenAt" in val || "date" in val)
      result[key] = hasDate
        ? {
            name: (val as { name: string }).name,
            lastSeenAt: ((val as { lastSeenAt?: string; date?: string }).lastSeenAt ??
              (val as { date: string }).date) as string,
          }
        : null
    }
    return result
  } catch {
    return emptyBagsData(bagCount)
  }
}

export function setBagHolder(teamId: string, bagNumber: number, name: string): FirstAidBagsData {
  const bagCount = getBagCountForTeam(teamId)
  if (bagNumber < 1 || bagNumber > bagCount) return getFirstAidBags(teamId)

  const key = getStorageKey(teamId)
  const current = getFirstAidBags(teamId)
  const lastSeenAt = new Date().toISOString()
  const holder: BagHolder = { name: name.trim(), lastSeenAt }

  const updated: FirstAidBagsData = {
    ...current,
    [`bag${bagNumber}`]: holder,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(updated))
  }

  return updated
}

export function clearBagHolder(teamId: string, bagNumber: number): FirstAidBagsData {
  const bagCount = getBagCountForTeam(teamId)
  if (bagNumber < 1 || bagNumber > bagCount) return getFirstAidBags(teamId)

  const key = getStorageKey(teamId)
  const current = getFirstAidBags(teamId)
  const updated = { ...current, [`bag${bagNumber}`]: null }

  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(updated))
  }
  return updated
}
