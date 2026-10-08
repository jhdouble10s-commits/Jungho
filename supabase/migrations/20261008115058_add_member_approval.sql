-- Extend the existing profile; never copy credentials or recreate existing users.
lock table auth.users in share row exclusive mode;
alter table public.user_profiles
  add column status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  add column display_name text check (char_length(display_name) between 1 and 80),
  add column email text,
  alter column username drop not null;

-- Preserve access for accounts that existed before the approval system.
update public.user_profiles p set status = 'approved', display_name = p.username, email = u.email
from auth.users u where u.id = p.user_id;
insert into public.user_profiles (user_id, email, display_name, status)
select id, email, nullif(left(trim(raw_user_meta_data->>'display_name'), 80), ''), 'approved'
from auth.users u where not exists (select 1 from public.user_profiles p where p.user_id = u.id);

-- This UUID was verified against the actual Auth + profile records on 2026-10-08.
-- Deliberately no username/display-name lookup and no password changes.
update public.user_profiles set role = 'admin', status = 'approved'
where user_id = 'eb205327-3994-46f0-b392-58c435c7e644'::uuid;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.is_approved_member() returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists (select 1 from public.user_profiles
    where user_id = (select auth.uid()) and status = 'approved');
$$;
create function private.is_approved_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_profiles
    where user_id = (select auth.uid()) and role = 'admin' and status = 'approved');
$$;
revoke all on function private.is_approved_member(), private.is_approved_admin() from public, anon, authenticated;
grant execute on function private.is_approved_member(), private.is_approved_admin() to authenticated;

-- Internal Auth trigger only: user-editable metadata cannot supply role, status or username.
create function private.create_member_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_profiles (user_id, email, display_name, role, status, created_at)
  values (new.id, new.email, nullif(left(trim(new.raw_user_meta_data->>'display_name'), 80), ''),
    'user', 'pending', coalesce(new.created_at, now()));
  return new;
end;
$$;
create function private.sync_member_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.user_profiles set email = new.email where user_id = new.id;
  return new;
end;
$$;
revoke all on function private.create_member_profile(), private.sync_member_email() from public, anon, authenticated, service_role;
create trigger sitescout_member_created after insert on auth.users
for each row execute function private.create_member_profile();
create trigger sitescout_member_email_changed after update of email on auth.users
for each row when (old.email is distinct from new.email) execute function private.sync_member_email();

alter table public.user_profiles enable row level security;
revoke all on public.user_profiles from public, anon, authenticated;
grant select on public.user_profiles to authenticated;
grant update (status) on public.user_profiles to authenticated;
create policy "Approved admins can read members" on public.user_profiles for select to authenticated
using ((select private.is_approved_admin()));
create policy "Approved admins can decide pending members" on public.user_profiles for update to authenticated
using ((select private.is_approved_admin()) and role = 'user' and status = 'pending')
with check ((select private.is_approved_admin()) and role = 'user' and status in ('approved', 'rejected'));
create index user_profiles_pending_created_idx on public.user_profiles (created_at, user_id)
where status = 'pending' and role = 'user';

-- Restrictive policies AND approval with every existing ownership policy, including ALL policies.
create policy "Approved members required for drafts" on public.epub_drafts as restrictive
for all to authenticated using ((select private.is_approved_member()))
with check ((select private.is_approved_member()));
create policy "Approved members required for epub assets" on storage.objects as restrictive
for all to authenticated
using (bucket_id <> 'epub-assets' or (select private.is_approved_member()))
with check (bucket_id <> 'epub-assets' or (select private.is_approved_member()));
