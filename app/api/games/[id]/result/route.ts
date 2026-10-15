import { type NextRequest, NextResponse } from "next/server"
import { getGameById, updateGameResult } from "@/lib/db"
import { normalizeRebounds, requireCounterToken, toPublicGame } from "@/lib/rebounds"
import { saveGameResultSchema, validate } from "@/lib/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsed = validate(saveGameResultSchema, await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: "Ottelua ei löytynyt" }, { status: 404 })
    }

    const tracking = normalizeRebounds(game.rebounds)
    if (tracking.trackBaskets && tracking.counterToken) {
      const tokenError = requireCounterToken(
        tracking,
        request.headers.get("X-Rebound-Token") ?? undefined
      )
      if (tokenError) {
        return NextResponse.json({ error: tokenError }, { status: 409 })
      }
    }

    const updated = await updateGameResult(id, parsed.data)
    if (!updated) {
      return NextResponse.json({ error: "Ottelua ei löytynyt" }, { status: 404 })
    }
    return NextResponse.json(toPublicGame(updated))
  } catch (error) {
    console.error("Failed to save game result:", error)
    return NextResponse.json({ error: "Tuloksen tallennus epäonnistui" }, { status: 500 })
  }
}
