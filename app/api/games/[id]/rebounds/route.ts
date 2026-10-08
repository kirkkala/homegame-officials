import { type NextRequest, NextResponse } from "next/server"
import { getGameById, updateGameRebounds } from "@/lib/db"
import {
  normalizeRebounds,
  removeLastMatchingRebound,
  requireCounterToken,
  toPublicRebounds,
} from "@/lib/rebounds"
import { reboundActionSchema, validate } from "@/lib/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsed = validate(reboundActionSchema, await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: "Ottelua ei löytynyt" }, { status: 404 })
    }

    const tracking = normalizeRebounds(game.rebounds)
    const action = parsed.data

    if (action.action === "claim") {
      const sameCounter = Boolean(action.token && action.token === tracking.counterToken)
      if (tracking.counterToken && !sameCounter && !action.takeOver) {
        return NextResponse.json(
          { error: `${tracking.counterName} pitää jo kirjaa` },
          { status: 409 }
        )
      }
      const token = sameCounter && action.token ? action.token : crypto.randomUUID()
      const updated = await updateGameRebounds(id, {
        ...tracking,
        counterName: action.name,
        counterToken: token,
      })
      return NextResponse.json({
        ...toPublicRebounds(updated?.rebounds ?? tracking, token),
        token,
      })
    }

    const tokenError = requireCounterToken(tracking, action.token)
    if (tokenError) {
      return NextResponse.json({ error: tokenError }, { status: 409 })
    }

    let next = tracking
    if (action.action === "release") {
      next = { ...tracking, counterName: null, counterToken: null }
    } else if (action.action === "add") {
      next = {
        ...tracking,
        events: [
          ...tracking.events,
          {
            id: crypto.randomUUID(),
            basket: action.basket,
            winner: action.winner,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    } else if (action.action === "remove") {
      next = {
        ...tracking,
        events: removeLastMatchingRebound(tracking.events, action.basket, action.winner),
      }
    }

    const updated = await updateGameRebounds(id, next)
    return NextResponse.json(toPublicRebounds(updated?.rebounds ?? next, action.token))
  } catch (error) {
    console.error("Failed to update rebounds:", error)
    return NextResponse.json({ error: "Levypallojen päivitys epäonnistui" }, { status: 500 })
  }
}
