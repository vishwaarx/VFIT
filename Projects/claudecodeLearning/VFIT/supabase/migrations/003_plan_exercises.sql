create table if not exists plan_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_plan_id uuid not null references workout_plans(id) on delete cascade,
  exercise_name text not null,
  target_sets integer not null,
  target_rep_min integer not null,
  target_rep_max integer not null,
  "order" integer not null,
  notes text
);

alter table plan_exercises enable row level security;
create policy "Allow all" on plan_exercises for all using (true) with check (true);
