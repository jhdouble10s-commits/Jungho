-- PROPOSAL ONLY. Run only after the new Edge Function is confirmed deployed.
-- Users remain in announced maintenance until synthetic HTTP tests pass.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
 if to_regprocedure('public.save_epub_project(uuid,bigint,jsonb)') is null
 or to_regprocedure('public.delete_epub_project(uuid,bigint)') is null
 or to_regclass('public.epub_project_deletions') is null
 or to_regprocedure('public.set_member_status(uuid,text,text)') is null then
  raise exception 'Required RPC missing: keep maintenance active';
 end if;
 if has_table_privilege('authenticated','public.epub_drafts','INSERT')
 or has_table_privilege('authenticated','public.epub_drafts','UPDATE')
 or has_table_privilege('authenticated','public.epub_drafts','DELETE') then
  raise exception 'Legacy writes remain enabled';
 end if;
 if not has_function_privilege('authenticated','public.save_epub_project(uuid,bigint,jsonb)','EXECUTE')
 or not has_function_privilege('authenticated','public.delete_epub_project(uuid,bigint)','EXECUTE')
 or not has_table_privilege('authenticated','public.epub_project_deletions','SELECT')
 or has_table_privilege('authenticated','public.epub_project_deletions','INSERT') then
  raise exception 'RPC or deletion-record grants are incorrect';
 end if;
 if not (select relrowsecurity from pg_class where oid='public.epub_project_deletions'::regclass) then
  raise exception 'Deletion records require RLS';
 end if;
end $$;
drop policy sitescout_cutover_insert on storage.objects;
drop policy sitescout_cutover_update on storage.objects;
drop policy sitescout_cutover_delete on storage.objects;
notify pgrst, 'reload schema';
-- Never restore old direct draft/status writes or legacy image overwrites.
commit;
