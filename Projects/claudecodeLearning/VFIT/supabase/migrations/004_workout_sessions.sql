create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references workout_plans(id),
  date date not null default current_date,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  voice_transcript text
);

alter table workout_sessions enable row level security;
create policy "Allow all" on workout_sessions for all using (true) with check (true);

create index idx_sessions_date on workout_sessions(date desc);
