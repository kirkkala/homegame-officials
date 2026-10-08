"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"
import { liveGameQueryOptions } from "@/lib/live-poll-query-options"
import { clearReboundToken, getReboundToken, setReboundToken } from "@/lib/rebound-session"
import {
  type Game,
  type GameResult,
  getGame,
  postReboundAction,
  saveGameResult,
} from "@/lib/storage"

export type ReboundClientAction =
  | { action: "claim"; name: string; takeOver?: boolean }
  | { action: "release" }
  | { action: "add"; basket: "home" | "away"; winner: "home" | "away" }
  | { action: "undo" }

export function useGame(gameId: string) {
  const [token, setToken] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    setToken(getReboundToken(gameId))
    setSessionReady(true)
  }, [gameId])

  const query = useQuery({
    queryKey: ["game", gameId, token],
    queryFn: () => getGame(gameId, token),
    enabled: sessionReady && !!gameId,
    ...liveGameQueryOptions,
  })

  const runAction = useCallback(
    async (action: ReboundClientAction) => {
      const body =
        action.action === "claim"
          ? { ...action, token: token ?? undefined }
          : token
            ? { ...action, token }
            : null
      if (!body) {
        throw new Error("Kukaan ei tilastoi tällä hetkellä")
      }

      const result = await postReboundAction(gameId, body)
      const nextToken = result.token ?? (action.action === "release" ? null : token)

      if (result.token) {
        setReboundToken(gameId, result.token)
        setToken(result.token)
      } else if (action.action === "release") {
        clearReboundToken(gameId)
        setToken(null)
      }

      queryClient.setQueryData(["game", gameId, nextToken], (prev: Game | undefined) => {
        const base = prev ?? query.data
        if (!base) return base
        return {
          ...base,
          rebounds: {
            counterName: result.counterName,
            events: result.events,
            isCounter: Boolean(nextToken),
          },
        }
      })
    },
    [gameId, query.data, queryClient, token]
  )

  const saveResult = useCallback(
    async (result: GameResult) => {
      const updated = await saveGameResult(gameId, result)
      queryClient.setQueryData(["game", gameId, token], (prev: Game | undefined) => {
        const base = prev ?? query.data
        if (!base) return updated
        return { ...base, result: updated.result }
      })
      queryClient.invalidateQueries({ queryKey: ["games"] })
    },
    [gameId, query.data, queryClient, token]
  )

  return { ...query, sessionReady, runAction, saveResult }
}
