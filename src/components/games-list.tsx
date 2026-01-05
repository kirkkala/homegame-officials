"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { GameCard } from "./game-card";
import { getGames, type Game } from "@/lib/storage";

export function GamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGames().then((storedGames) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setGames(
        storedGames
          .filter((game) => new Date(game.date) >= now)
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      );
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (games.length === 0) {
    return (
      <Stack alignItems="center" py={8}>
        <CalendarMonthIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>Ei tulevia kotipelejä</Typography>
        <Typography color="text.secondary" mb={3}>Tuo kotipelit Excel-tiedostosta aloittaaksesi.</Typography>
        <Button component={Link} href="/hallinta" variant="contained" startIcon={<UploadFileIcon />}>
          Tuo pelit Excelistä
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">Tulevat kotipelit</Typography>
        <Chip label={`${games.length} peliä`} color="primary" />
      </Stack>
      <Stack gap={2}>
        {games.map((game) => <GameCard key={game.id} game={game} />)}
      </Stack>
    </Stack>
  );
}
