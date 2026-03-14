-- Token usage tracking table
create table if not exists token_usage (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  deployment text not null,
  feature text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

alter table token_usage enable row level security;
create policy "Allow all" on token_usage for all using (true) with check (true);

create index idx_token_usage_created on token_usage(created_at desc);
create index idx_token_usage_feature on token_usage(feature);
