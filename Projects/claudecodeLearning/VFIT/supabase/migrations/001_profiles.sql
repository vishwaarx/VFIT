create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'User',
  goal_weight numeric,
  daily_protein_target integer not null default 150,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Allow all for single user" on profiles for all using (true) with check (true);
