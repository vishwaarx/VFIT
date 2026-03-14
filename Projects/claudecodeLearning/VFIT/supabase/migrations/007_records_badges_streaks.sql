create table if not exists personal_records (
  id uuid primary key default gen_random_uuid(),
  exercise_name text not null,
  weight numeric not null,
  reps integer not null,
  estimated_1rm numeric not null,
  achieved_date date not null default current_date,
  session_id uuid references workout_sessions(id)
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  badge_key text not null unique,
  badge_name text not null,
  description text not null,
  icon text not null,
  earned_at timestamptz not null default now()
);

create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  streak_type text not null check (streak_type in ('workout', 'photo')),
  current_count integer not null default 0,
  longest_count integer not null default 0,
  last_active_date date
);

alter table personal_records enable row level security;
create policy "Allow all" on personal_records for all using (true) with check (true);

alter table badges enable row level security;
create policy "Allow all" on badges for all using (true) with check (true);

alter table streaks enable row level security;
create policy "Allow all" on streaks for all using (true) with check (true);

create index idx_pr_exercise on personal_records(exercise_name, estimated_1rm desc);
