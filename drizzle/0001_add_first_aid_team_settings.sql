-- Add first aid bag settings to teams table
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "first_aid_bags_enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "first_aid_bag_count" text DEFAULT '3' NOT NULL;
