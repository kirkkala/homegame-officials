-- Final score for a game (home/away points), set once the game has ended
ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "result" jsonb;
