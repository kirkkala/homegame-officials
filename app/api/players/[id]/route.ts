import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

type DB = {
  games: unknown[];
  players: { id: string; name: string; createdAt: string }[];
};

async function readDB(): Promise<DB> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { games: [], players: [] };
  }
}

async function writeDB(db: DB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// DELETE player
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await readDB();
  
  const filtered = db.players.filter((p) => p.id !== id);
  if (filtered.length === db.players.length) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }
  
  db.players = filtered;
  await writeDB(db);
  
  return NextResponse.json({ success: true });
}

