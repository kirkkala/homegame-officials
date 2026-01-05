"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { parseExcelFile, type ParsedGame } from "@/lib/excel-parser";
import {
  saveGames,
  clearAllGames,
  getGames,
  getPlayers,
  savePlayer,
  deletePlayer,
  type Player,
} from "@/lib/storage";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];
  const months = ["tammi", "helmi", "maalis", "huhti", "touko", "kesä", "heinä", "elo", "syys", "loka", "marras", "joulu"];
  return `${weekdays[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]}`;
}

export default function HallintaPage() {
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [existingGamesCount, setExistingGamesCount] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerNames, setPlayerNames] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const [games, loadedPlayers] = await Promise.all([getGames(), getPlayers()]);
      setExistingGamesCount(games.length);
      setPlayers(loadedPlayers);
    };
    loadData();
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setImportStatus("❌ Virhe: Valitse Excel-tiedosto (.xlsx tai .xls)");
      return;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      setParsedGames(parseExcelFile(arrayBuffer));
      setImportStatus(null);
    } catch (error) {
      console.error("Error parsing Excel:", error);
      setImportStatus("❌ Virhe Excel-tiedoston lukemisessa");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleImport = useCallback(async () => {
    const saved = await saveGames(parsedGames.map((g) => ({
      divisionId: g.division, opponent: g.opponent, date: g.date, time: g.time, location: g.location,
    })));
    setImportStatus(`✅ Tuotu ${saved.length} kotipeliä!${parsedGames.length - saved.length > 0 ? ` (${parsedGames.length - saved.length} duplikaattia ohitettu)` : ""}`);
    setParsedGames([]);
    setExistingGamesCount((await getGames()).length);
  }, [parsedGames]);

  const handleClearAll = useCallback(async () => {
    if (confirm("Haluatko varmasti poistaa kaikki pelit?")) {
      await clearAllGames();
      setExistingGamesCount(0);
      setImportStatus("🗑️ Kaikki pelit poistettu");
    }
  }, []);

  const handleAddPlayers = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const names = playerNames.split("\n").map((n) => n.trim()).filter((n) => n.length > 0);
    if (names.length === 0) return;
    
    const existingNames = new Set(players.map((p) => p.name.toLowerCase()));
    const newNames = names.filter((n) => !existingNames.has(n.toLowerCase()));
    
    const newPlayers: Player[] = [];
    for (const name of newNames) {
      const player = await savePlayer(name);
      newPlayers.push(player);
    }
    
    setPlayers([...players, ...newPlayers]);
    setPlayerNames("");
    if (newPlayers.length < names.length) {
      setImportStatus(`✅ Lisätty ${newPlayers.length} pelaajaa (${names.length - newPlayers.length} duplikaattia ohitettu)`);
    }
  }, [playerNames, players]);

  const handleDeletePlayer = useCallback(async (id: string) => {
    if (confirm("Haluatko varmasti poistaa tämän pelaajan?")) {
      await deletePlayer(id);
      setPlayers(players.filter((p) => p.id !== id));
    }
  }, [players]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/20 text-lg hover:bg-muted/30 transition-colors">←</Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Hallinta</h1>
              <p className="text-sm text-muted">Pelaajat ja pelien tuonti</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {importStatus && (
          <div className={`rounded-xl p-4 text-center font-medium ${importStatus.startsWith("✅") ? "bg-success/10 text-success" : importStatus.startsWith("❌") ? "bg-red-100 text-red-600" : "bg-muted/10 text-muted"}`}>
            {importStatus}
          </div>
        )}

        {/* Player Management */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold mb-4">👥 Pelaajat</h2>
          
          <form onSubmit={handleAddPlayers} className="mb-4">
            <textarea
              value={playerNames}
              onChange={(e) => setPlayerNames(e.target.value)}
              placeholder={"Lisää pelaajia (yksi per rivi)"}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-2"
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Lisää pelaajat
            </button>
          </form>

          {players.length === 0 ? (
            <p className="text-sm text-muted italic">Ei pelaajia lisätty vielä.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 rounded-lg bg-muted/10 px-3 py-1.5 text-sm">
                  <span>{player.name}</span>
                  <button onClick={() => handleDeletePlayer(player.id)} className="text-muted hover:text-red-500 transition-colors">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Games Management */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📊 Pelit</h2>
            {existingGamesCount > 0 && (
              <button onClick={handleClearAll} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                Tyhjennä ({existingGamesCount})
              </button>
            )}
          </div>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
          >
            <p className="text-muted mb-4">Vedä Excel-tiedosto tähän tai</p>
            <label className="inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
              Valitse tiedosto
              <input type="file" accept=".xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            </label>
          </div>
        </div>

        {/* Preview */}
        {parsedGames.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Esikatselu: {parsedGames.length} kotipeliä</h2>
              <button onClick={handleImport} className="rounded-xl bg-success px-6 py-3 font-medium text-white hover:bg-success/90 transition-colors">✓ Tuo pelit</button>
            </div>
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="px-4 py-3 text-left font-semibold">Divisioona</th>
                    <th className="px-4 py-3 text-left font-semibold">Vastustaja</th>
                    <th className="px-4 py-3 text-left font-semibold">Päivämäärä</th>
                    <th className="px-4 py-3 text-left font-semibold">Aika</th>
                    <th className="px-4 py-3 text-left font-semibold">Paikka</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedGames.map((game, index) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/5">
                      <td className="px-4 py-3"><span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">{game.division}</span></td>
                      <td className="px-4 py-3 font-medium">{game.opponent}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(game.date)}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{game.time}</td>
                      <td className="px-4 py-3 text-muted">{game.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
