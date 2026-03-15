create table if not exists weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  challenge_text text not null,
  target_value numeric not null default 1,
  current_value numeric not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz
);

create table if not exists photo_checkins (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  photo_count integer not null default 0,
  notes text
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now(),
  metadata jsonb
);

create table if not exists notification_settings (
  id uuid primary key default gen_random_uuid(),
  morning_checkin_time time not null default '07:00',
  missed_workout_time time not null default '19:00',
  photo_checkin_day integer not null default 0,
  push_enabled boolean not null default false,
  fcm_token text
);

alter table weekly_challenges enable row level security;
create policy "Allow all" on weekly_challenges for all using (true) with check (true);

alter table photo_checkins enable row level security;
create policy "Allow all" on photo_checkins for all using (true) with check (true);

alter table chat_messages enable row level security;
create policy "Allow all" on chat_messages for all using (true) with check (true);

alter table notification_settings enable row level security;
create policy "Allow all" on notification_settings for all using (true) with check (true);

create index idx_chat_created on chat_messages(created_at asc);
create index idx_challenges_week on weekly_challenges(week_start_date desc);
