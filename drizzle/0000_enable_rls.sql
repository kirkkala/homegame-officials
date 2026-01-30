-- Enable RLS for all public tables exposed to PostgREST.
-- Note: service role bypasses RLS; add policies if client access is needed.
alter table public.players enable row level security;
alter table public.users enable row level security;
alter table public.team_managers enable row level security;
alter table public.games enable row level security;
alter table public.teams enable row level security;
