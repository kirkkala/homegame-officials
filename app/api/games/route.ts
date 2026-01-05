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

// GET all games
export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.games);
}

// POST new games (bulk import)
export async function POST(request: Request) {
  const db = await readDB();
  const newGames: Omit<Game, "id" | "createdAt" | "officials">[] = await request.json();
  
  const savedGames: Game[] = [];
  
  for (const game of newGames) {
    // Check for duplicates
    const isDuplicate = db.games.some(
      (g) => g.date === game.date && g.time === game.time && g.opponent === game.opponent
    );
    
    if (!isDuplicate) {
      const newGame: Game = {
        ...game,
        id: crypto.randomUUID(),
        officials: { poytakirja: null, kello: null },
        createdAt: new Date().toISOString(),
      };
      db.games.push(newGame);
      savedGames.push(newGame);
    }
  }
  
  await writeDB(db);
  return NextResponse.json(savedGames);
}

// DELETE all games
export async function DELETE() {
  const db = await readDB();
  db.games = [];
  await writeDB(db);
  return NextResponse.json({ success: true });
}

