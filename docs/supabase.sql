-- PoseForge Supabase schema (optional). Run in the Supabase SQL editor.
create table if not exists public.prompts (
  id text primary key,
  owner text not null default 'default',
  created_at timestamptz not null,
  status text not null default 'unused',
  starred boolean not null default false,
  payload jsonb not null
);
create index if not exists prompts_owner_created on public.prompts (owner, created_at desc);

create table if not exists public.app_state (
  owner text not null default 'default',
  kind text not null,               -- 'settings' | 'pools'
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner, kind)
);

alter table public.prompts enable row level security;
alter table public.app_state enable row level security;

-- WARNING: these policies let anyone holding your anon key read and write ALL rows.
-- That is only acceptable for a private, single-user deployment whose URL/key you do not share.
-- For anything else, add Supabase Auth and replace `owner` with auth.uid()::text and the policies below
-- with `using (owner = auth.uid()::text) with check (owner = auth.uid()::text)`.
create policy "prompts open" on public.prompts for all using (true) with check (true);
create policy "app_state open" on public.app_state for all using (true) with check (true);
