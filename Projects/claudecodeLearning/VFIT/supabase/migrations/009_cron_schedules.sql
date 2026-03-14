-- pg_cron schedules for push notification edge functions
-- Requires pg_cron extension enabled in Supabase dashboard (Database > Extensions)

-- Enable pg_cron and pg_net extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Morning check-in: daily at 07:00 UTC (adjust for user's timezone)
select cron.schedule(
  'morning-checkin',
  '0 7 * * *',
  $$
  select net.http_post(
    url := (select concat(current_setting('app.settings.supabase_url'), '/functions/v1/morning-checkin')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Missed workout nudge: daily at 19:00 UTC (adjust for user's timezone)
select cron.schedule(
  'missed-workout',
  '0 19 * * *',
  $$
  select net.http_post(
    url := (select concat(current_setting('app.settings.supabase_url'), '/functions/v1/missed-workout')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Weekly photo reminder: every Sunday at 10:00 UTC
select cron.schedule(
  'weekly-photo-reminder',
  '0 10 * * 0',
  $$
  select net.http_post(
    url := (select concat(current_setting('app.settings.supabase_url'), '/functions/v1/weekly-photo-reminder')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Weekly challenge: every Monday at 06:00 UTC
select cron.schedule(
  'weekly-challenge',
  '0 6 * * 1',
  $$
  select net.http_post(
    url := (select concat(current_setting('app.settings.supabase_url'), '/functions/v1/weekly-challenge')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
    ),
    body := '{}'::jsonb
  );
  $$
);
