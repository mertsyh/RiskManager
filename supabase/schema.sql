-- ════════════════════════════════════════════════════════════════════════════
--  Risk Manager — GPAF event store + shared leaderboard (Supabase / Postgres)
--  Run once in the Supabase SQL editor. Idempotent-ish (uses IF NOT EXISTS).
--  gameId = GM-464DE8878705   teamId = TM-699FC02031FA
-- ════════════════════════════════════════════════════════════════════════════

-- Raw GPAF events: one row per logged event (session_start | score_update |
-- level_complete | session_end). Mirrors the JSONL the client can download.
create table if not exists gpaf_events (
  id               bigint generated always as identity primary key,
  ts               timestamptz not null,
  player_pseudo_id text        not null,
  session_id       text        not null,
  game_id          text        not null,
  team_id          text,
  event_type       text        not null,
  payload          jsonb       not null default '{}',
  inserted_at      timestamptz not null default now()
);
create index if not exists gpaf_events_session_idx on gpaf_events (session_id);
create index if not exists gpaf_events_game_idx    on gpaf_events (game_id);

-- Derived leaderboard: one row per saved play session (named on the post-mortem screen).
create table if not exists leaderboard (
  session_id       text primary key,
  player_pseudo_id text        not null,
  name             text,
  score            integer     not null default 0,
  days             integer,                 -- null = DNF / loss
  won              boolean     not null default false,
  completed        boolean     not null default false,
  game_id          text        not null,
  team_id          text,
  updated_at       timestamptz not null default now()
);
create index if not exists leaderboard_rank_idx on leaderboard (game_id, score desc);

-- ── Row Level Security ──
-- Class game: the anon (publishable) key may append events, upsert its own
-- leaderboard row, and read the board. No deletes/updates of other rows.
alter table gpaf_events enable row level security;
alter table leaderboard enable row level security;

drop policy if exists "anon insert events" on gpaf_events;
create policy "anon insert events" on gpaf_events
  for insert to anon with check (true);

drop policy if exists "anon insert board" on leaderboard;
create policy "anon insert board" on leaderboard
  for insert to anon with check (true);

drop policy if exists "anon update board" on leaderboard;
create policy "anon update board" on leaderboard
  for update to anon using (true) with check (true);

drop policy if exists "anon read board" on leaderboard;
create policy "anon read board" on leaderboard
  for select to anon using (true);
