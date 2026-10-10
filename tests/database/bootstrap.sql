-- Synthetic data only. Application table/ACL/policy contract checked against
-- production catalog metadata on 2026-10-10; Auth/Storage remain SQL stand-ins.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema storage;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema public,auth,storage to authenticated,anon,service_role;
grant execute on function auth.uid() to authenticated,anon,service_role;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}',created_at timestamptz default now());
create table public.epub_drafts(id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid(),title text not null check(char_length(trim(title)) between 1 and 200),payload jsonb not null default '{}',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(owner_id,title));
alter table public.epub_drafts enable row level security;
grant all on public.epub_drafts to authenticated,anon,service_role;
create policy owner_drafts on public.epub_drafts to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create table storage.objects(id uuid default gen_random_uuid() primary key,bucket_id text,name text,owner_id text,unique(bucket_id,name));
create function storage.foldername(text) returns text[] language sql immutable as $$ select (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1] $$;
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to authenticated;
-- The production policy is ALL despite its historical "delete" label.
create policy "Draft owners can delete assets" on storage.objects to public using(bucket_id='epub-assets' and (storage.foldername(name))[1]=auth.uid()::text);
