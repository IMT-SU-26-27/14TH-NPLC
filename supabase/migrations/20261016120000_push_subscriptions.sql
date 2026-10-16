-- Web push: one row per browser/device that turned notifications on.
-- Rows are written and read for sending by the server (service role); users can only see and delete their own.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null check (endpoint ~ '^https://'),
  p256dh text not null,
  auth text not null,
  locale text not null default 'id' check (locale in ('id', 'en')), -- language of the notification text
  user_agent text,
  created_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_key unique (endpoint)
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions: read own" on public.push_subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "push_subscriptions: delete own" on public.push_subscriptions
  for delete to authenticated
  using (user_id = (select auth.uid()));

grant select, delete on table public.push_subscriptions to authenticated;
grant all on table public.push_subscriptions to service_role;
