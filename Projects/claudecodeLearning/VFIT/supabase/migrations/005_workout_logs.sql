create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_name text not null,
  set_number integer not null,
  weight numeric not null default 0,
  reps integer not null default 0,
  unit text not null default 'kg',
  is_pr boolean not null default false,
  created_at timestamptz not null default now(),
  -- W12: Prevent duplicate set rows
  unique (session_id, exercise_name, set_number)
);

alter table workout_logs enable row level security;
create policy "Allow all" on workout_logs for all using (true) with check (true);

create index idx_logs_session on workout_logs(session_id);
create index idx_logs_exercise on workout_logs(exercise_name, created_at desc);
