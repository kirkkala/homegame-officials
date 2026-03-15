"use client"

import { useCallback, useEffect, useState } from "react"
import type { FirstAidBagsData } from "@/db/schema"
import { getFirstAidBags } from "@/lib/first-aid-bags"

export function useFirstAidBags(teamId: string | null) {
  const [bags, setBags] = useState<FirstAidBagsData>({})

  const refresh = useCallback(async () => {
    if (teamId) setBags(await getFirstAidBags(teamId))
  }, [teamId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [refresh])

  return { bags, refresh }
}
