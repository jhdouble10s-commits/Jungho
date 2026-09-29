create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username = lower(username) and username ~ '^[a-z0-9][a-z0-9_.-]{2,31}$'),
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read their own profile"
on public.user_profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists user_profiles_username_idx on public.user_profiles (username);
