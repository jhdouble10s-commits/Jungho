-- Synthetic local Supabase contract, NOT a copy of production policies/data.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create schema storage;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema public,auth,storage to authenticated,anon,service_role;
grant execute on function auth.uid() to authenticated,anon,service_role;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}',created_at timestamptz default now());
create table public.epub_drafts(owner_id uuid references auth.users,title text,payload jsonb,updated_at timestamptz default now(),primary key(owner_id,title));
alter table public.epub_drafts enable row level security;
grant select,insert,update,delete on public.epub_drafts to authenticated;
create policy owner_drafts on public.epub_drafts to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create table storage.objects(id uuid default gen_random_uuid() primary key,bucket_id text,name text,owner_id text,unique(bucket_id,name));
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to authenticated;
create policy owner_assets on storage.objects to authenticated using(bucket_id='epub-assets' and split_part(name,'/',1)=auth.uid()::text) with check(bucket_id='epub-assets' and split_part(name,'/',1)=auth.uid()::text);
