"use client";

import { useState, useEffect } from "react";
import { assignOfficial, getPlayers, type Player } from "@/lib/storage";

type Game = {
  id: string;
  division: string;
  opponent: string;
  date: string;
  time: string;
  location: string;
  officials: {
    poytakirja: string | null;
    kello: string | null;
  };
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];
  const months = [
    "tammi", "helmi", "maalis", "huhti", "touko", "kesä",
    "heinä", "elo", "syys", "loka", "marras", "joulu",
  ];

  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${weekday} ${day}. ${month}`;
}

function OfficialBadge({
  gameId,
  role,
  name,
  onAssign,
}: {
  gameId: string;
  role: "poytakirja" | "kello";
  name: string | null;
  onAssign: (role: "poytakirja" | "kello", playerName: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isAssigned = name !== null;
  const icon = role === "poytakirja" ? "📋" : "⏱️";
  const roleLabel = role === "poytakirja" ? "Pöytäkirja" : "Kello";

  const handleClick = async () => {
    setIsLoading(true);
    const loadedPlayers = await getPlayers();
    setPlayers(loadedPlayers);
    setIsLoading(false);
    setIsOpen(true);
  };

  const handleSelect = (playerName: string | null) => {
    onAssign(role, playerName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-all ${
          isAssigned
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-warning/10 text-warning hover:bg-warning/20"
        }`}
      >
        <span>{isLoading ? "⏳" : icon}</span>
        <div className="flex flex-col">
          <span className="font-medium">{roleLabel}</span>
          <span className={isAssigned ? "" : "italic"}>
            {name || "Valitse →"}
          </span>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {players.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted">
                  Ei pelaajia. Lisää pelaajia ensin.
                </div>
              ) : (
                <>
                  {isAssigned && (
                    <button
                      onClick={() => handleSelect(null)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600"
                    >
                      ✕ Poista valinta
                    </button>
                  )}
                  {players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelect(player.name)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/10 ${
                        player.name === name ? "bg-primary/10 text-primary font-medium" : ""
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function GameCard({ game: initialGame }: { game: Game }) {
  const [game, setGame] = useState(initialGame);
  
  // Update when initialGame changes (e.g., after page refresh)
  useEffect(() => {
    setGame(initialGame);
  }, [initialGame]);
  
  const allAssigned =
    game.officials.poytakirja !== null && game.officials.kello !== null;
  const noneAssigned =
    game.officials.poytakirja === null && game.officials.kello === null;

  const handleAssign = async (role: "poytakirja" | "kello", playerName: string | null) => {
    // Optimistic update
    setGame({
      ...game,
      officials: { ...game.officials, [role]: playerName },
    });
    
    // Save to server
    await assignOfficial(game.id, role, playerName);
  };

  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {game.division}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                allAssigned
                  ? "bg-success/10 text-success"
                  : noneAssigned
                    ? "bg-warning/10 text-warning"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {allAssigned
                ? "✓ Valmis"
                : noneAssigned
                  ? "Toimitsijat puuttuu"
                  : "Osittain täytetty"}
            </span>
          </div>
          <h3 className="text-lg font-semibold">vs. {game.opponent}</h3>
        </div>

        <div className="text-right">
          <div className="text-lg font-semibold text-primary">{game.time}</div>
          <div className="text-sm text-muted">{formatDate(game.date)}</div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <span>📍</span>
        <span>{game.location}</span>
      </div>

      {/* Officials */}
      <div className="grid grid-cols-2 gap-3">
        <OfficialBadge
          gameId={game.id}
          role="poytakirja"
          name={game.officials.poytakirja}
          onAssign={handleAssign}
        />
        <OfficialBadge
          gameId={game.id}
          role="kello"
          name={game.officials.kello}
          onAssign={handleAssign}
        />
      </div>
    </div>
  );
}
