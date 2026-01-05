"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameCard } from "./game-card";
import { getGames, type Game } from "@/lib/storage";

export function GamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGames = async () => {
    const storedGames = await getGames();
    // Sort by date and time, filter for upcoming games
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = storedGames
      .filter((game) => new Date(game.date) >= now)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
    
    setGames(upcoming);
    setIsLoading(false);
  };

  useEffect(() => {
    loadGames();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center">
        <div className="text-4xl mb-4 animate-pulse">🏀</div>
        <p className="text-muted">Ladataan...</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-xl font-semibold mb-2">Ei tulevia kotipelejä</h2>
        <p className="text-muted mb-6">
          Tuo kotipelit Excel-tiedostosta aloittaaksesi.
        </p>
        <Link
          href="/hallinta"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <span>📊</span>
          <span>Tuo pelit Excelistä</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tulevat kotipelit</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {games.length} peliä
        </span>
      </div>

      <div className="space-y-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={{
              id: game.id,
              division: game.divisionId,
              opponent: game.opponent,
              date: game.date,
              time: game.time,
              location: game.location,
              officials: game.officials,
            }}
          />
        ))}
      </div>
    </div>
  );
}
