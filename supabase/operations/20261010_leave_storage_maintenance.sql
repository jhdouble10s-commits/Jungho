-- PROPOSAL ONLY. Run only after the new Edge Function is confirmed deployed.
-- Users remain in announced maintenance until synthetic HTTP tests pass.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
 if to_regprocedure('public.save_epub_project(uuid,bigint,jsonb)') is null
 or to_regprocedure('public.delete_epub_project(uuid,bigint)') is null
 or to_regprocedure('public.set_member_status(uuid,text,text)') is null then
  raise exception 'Required RPC missing: keep maintenance active';
 end if;
 if has_table_privilege('authenticated','public.epub_drafts','INSERT')
 or has_table_privilege('authenticated','public.epub_drafts','UPDATE')
 or has_table_privilege('authenticated','public.epub_drafts','DELETE') then
  raise exception 'Legacy writes remain enabled';
 end if;
end $$;
drop policy sitescout_cutover_insert on storage.objects;
drop policy sitescout_cutover_update on storage.objects;
drop policy sitescout_cutover_delete on storage.objects;
-- Never restore old direct draft/status writes or legacy image overwrites.
commit;
