// Client API for first aid bag tracking (fetches from DB via API)

import type { BagHolder, FirstAidBagsData } from "@/db/schema"

export type { BagHolder, FirstAidBagsData }

/** @TODO: Replace with admin configuration */
export function getBagCountForTeam(_teamId: string): number {
  return 3
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    let error = "Pyyntö epäonnistui"
    try {
      const data = JSON.parse(text)
      error = data.error ?? error
    } catch {
      // ignore
    }
    throw new Error(error)
  }
  return res.json()
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
