import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

type Game = {
  id: string;
  divisionId: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  officials: {
    poytakirja: string | null;
    kello: string | null;
  };
  createdAt: string;
};

type DB = {
  games: Game[];
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

// PATCH - update game (for assigning officials)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();
  const db = await readDB();
  
  const index = db.games.findIndex((g) => g.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  
  // Merge officials properly
  if (updates.officials) {
    db.games[index].officials = {
      ...db.games[index].officials,
      ...updates.officials,
    };
  }
  
  // Merge other updates
  const { officials, ...otherUpdates } = updates;
  db.games[index] = { ...db.games[index], ...otherUpdates };
  
  await writeDB(db);
  
  return NextResponse.json(db.games[index]);
}
