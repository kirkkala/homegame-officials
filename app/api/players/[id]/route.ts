import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();

  const index = db.players.findIndex((p) => p.id === id);
  if (index === -1) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  db.players.splice(index, 1);
  await writeDB(db);
  return NextResponse.json({ success: true });
}
