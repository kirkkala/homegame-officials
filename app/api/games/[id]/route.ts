import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { officials } = await request.json();
  const db = await readDB();

  const game = db.games.find((g) => g.id === id);
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  game.officials = { ...game.officials, ...officials };
  await writeDB(db);
  return NextResponse.json(game);
}
