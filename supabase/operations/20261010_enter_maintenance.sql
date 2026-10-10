-- PROPOSAL ONLY. Production execution requires separate explicit approval.
-- Initial cutover only; never use this file to repair migration history.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
 if to_regprocedure('public.save_epub_project(uuid,bigint,jsonb)') is not null then
  raise exception 'Save RPC already exists; recheck live state before entering this initial cutover';
 end if;
end $$;
lock table public.epub_drafts, public.user_profiles, storage.objects in share row exclusive mode;
revoke insert, update, delete, truncate on public.epub_drafts from public, anon, authenticated;
revoke update(status) on public.user_profiles from authenticated;
create policy sitescout_cutover_insert on storage.objects as restrictive for insert to anon,authenticated
 with check(bucket_id <> 'epub-assets');
create policy sitescout_cutover_update on storage.objects as restrictive for update to anon,authenticated
 using(bucket_id <> 'epub-assets') with check(bucket_id <> 'epub-assets');
create policy sitescout_cutover_delete on storage.objects as restrictive for delete to anon,authenticated
 using(bucket_id <> 'epub-assets');
commit;
