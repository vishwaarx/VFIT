create table if not exists workout_plans (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  day_label text not null,
  "order" integer not null,
  is_rest_day boolean not null default false
);

alter table workout_plans enable row level security;
create policy "Allow all" on workout_plans for all using (true) with check (true);
