import { NextResponse } from "next/server"
import { readDB, writeDB } from "@/lib/db"

export async function GET() {
  const db = await readDB()
  return NextResponse.json(db.players)
}

export async function POST(request: Request) {
  const db = await readDB()
  const { name } = await request.json()

  const newPlayer = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() }
  db.players.push(newPlayer)
  await writeDB(db)
  return NextResponse.json(newPlayer)
}
