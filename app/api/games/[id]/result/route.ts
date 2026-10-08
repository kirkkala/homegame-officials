import { type NextRequest, NextResponse } from "next/server"
import { updateGameResult } from "@/lib/db"
import { toPublicGame } from "@/lib/rebounds"
import { saveGameResultSchema, validate } from "@/lib/validation"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsed = validate(saveGameResultSchema, await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
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
