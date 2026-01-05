import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

type Player = {
  id: string;
  name: string;
  createdAt: string;
};

type DB = {
  games: unknown[];
  players: Player[];
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

// GET all players
export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.players);
}

// POST new player
export async function POST(request: Request) {
  const db = await readDB();
  const { name } = await request.json();
  
  const newPlayer: Player = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  
  db.players.push(newPlayer);
  await writeDB(db);
  
  return NextResponse.json(newPlayer);
}

