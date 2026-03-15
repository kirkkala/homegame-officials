// Client API for first aid bag tracking (fetches from DB via API)

import type { BagHolder, FirstAidBagsData } from "@/db/schema"
import { parseJsonResponse } from "@/lib/api"

export type { BagHolder, FirstAidBagsData }

/** @TODO: Replace with admin configuration */
export function getBagCountForTeam(_teamId: string): number {
  return 3
}

export async function getFirstAidBags(teamId: string): Promise<FirstAidBagsData> {
  const res = await fetch(`/api/first-aid-bags?teamId=${encodeURIComponent(teamId)}`)
  const data = await parseJsonResponse<FirstAidBagsData>(res)
  const bagCount = getBagCountForTeam(teamId)
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
  name: string
): Promise<FirstAidBagsData> {
  const bagCount = getBagCountForTeam(teamId)
  if (bagNumber < 1 || bagNumber > bagCount) return getFirstAidBags(teamId)

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

export async function clearBagHolder(teamId: string, bagNumber: number): Promise<FirstAidBagsData> {
  const bagCount = getBagCountForTeam(teamId)
  if (bagNumber < 1 || bagNumber > bagCount) return getFirstAidBags(teamId)

  const res = await fetch("/api/first-aid-bags", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, bagNumber, holder: null }),
  })
  return parseJsonResponse<FirstAidBagsData>(res)
}
