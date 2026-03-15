// Client API for first aid bag tracking (fetches from DB via API)

import type { BagHolder, FirstAidBagsData } from "@/db/schema"
import { parseJsonResponse } from "@/lib/api"

export type { BagHolder, FirstAidBagsData }

/** Returns bag count from team settings, or 3 as default. */
export function getBagCountForTeam(team: { firstAidBagCount?: string } | null): number {
  if (!team?.firstAidBagCount) return 3
  const n = parseInt(team.firstAidBagCount, 10)
  return Number.isNaN(n) || n < 1 || n > 6 ? 3 : n
}

export async function getFirstAidBags(
  teamId: string,
  team?: { firstAidBagCount?: string } | null
): Promise<FirstAidBagsData> {
  const res = await fetch(`/api/first-aid-bags?teamId=${encodeURIComponent(teamId)}`)
  const data = await parseJsonResponse<FirstAidBagsData>(res)
  const bagCount = getBagCountForTeam(team ?? null)
  const result: FirstAidBagsData = {}
  for (let i = 1; i <= bagCount; i++) {
    const key = `bag${i}`
    const val = data[key]
    result[key] =
      val && typeof val === "object" && "name" in val && "lastSeenAt" in val
        ? { name: val.name, lastSeenAt: val.lastSeenAt }
        : null
  }
  return result
}

export async function setBagHolder(
  teamId: string,
  bagNumber: number,
  name: string,
  team?: { firstAidBagCount?: string } | null
): Promise<FirstAidBagsData> {
  const bagCount = getBagCountForTeam(team ?? null)
  if (bagNumber < 1 || bagNumber > bagCount) return getFirstAidBags(teamId, team)

  const res = await fetch("/api/first-aid-bags", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teamId,
      bagNumber,
      holder: { name: name.trim() },
    }),
  })
  return parseJsonResponse<FirstAidBagsData>(res)
}

export async function clearBagHolder(
  teamId: string,
  bagNumber: number,
  team?: { firstAidBagCount?: string } | null
): Promise<FirstAidBagsData> {
  const bagCount = getBagCountForTeam(team ?? null)
  if (bagNumber < 1 || bagNumber > bagCount) return getFirstAidBags(teamId, team)

  const res = await fetch("/api/first-aid-bags", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, bagNumber, holder: null }),
  })
  return parseJsonResponse<FirstAidBagsData>(res)
}
