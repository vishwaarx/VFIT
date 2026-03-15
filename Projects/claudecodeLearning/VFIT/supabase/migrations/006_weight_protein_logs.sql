create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  weight numeric not null,
  unit text not null default 'kg',
  notes text
);

create table if not exists protein_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  grams integer not null,
  meal_label text,
  created_at timestamptz not null default now()
);

alter table weight_logs enable row level security;
create policy "Allow all" on weight_logs for all using (true) with check (true);

alter table protein_logs enable row level security;
create policy "Allow all" on protein_logs for all using (true) with check (true);

create index idx_weight_date on weight_logs(date desc);
create index idx_protein_date on protein_logs(date desc);
