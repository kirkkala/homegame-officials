import { type NextRequest, NextResponse } from "next/server"
import { getFirstAidBagsData, updateBagHolder } from "@/lib/db"
import { updateBagHolderSchema, validate } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const teamId = request.nextUrl.searchParams.get("teamId")
    if (!teamId) {
      return NextResponse.json({ error: "teamId required" }, { status: 400 })
    }
    const data = await getFirstAidBagsData(teamId)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to get first aid bags:", error)
    return NextResponse.json({ error: "Ensiapulaukkujen haku epäonnistui" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const result = validate(updateBagHolderSchema, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    const { teamId, bagNumber, holder } = result.data
    const holderOrNull =
      holder !== null ? { name: holder.name, lastSeenAt: new Date().toISOString() } : null
    const data = await updateBagHolder(teamId, bagNumber, holderOrNull)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to update bag holder:", error)
    return NextResponse.json({ error: "Ensiapulaukun päivitys epäonnistui" }, { status: 500 })
  }
}
