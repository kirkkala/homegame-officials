-- Team-level rebound tracking per game (counter lock + event log)
ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "rebounds" jsonb DEFAULT '{"counterName":null,"counterToken":null,"events":[]}'::jsonb NOT NULL;
