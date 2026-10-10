\set ON_ERROR_STOP on
select test_assert((select count(*)=1 from epub_drafts d join local_test.legacy_before b using(id)
 where d.owner_id=b.owner_id and d.title=b.title and d.created_at=b.created_at and d.updated_at=b.updated_at
 and d.payload - 'projectId' - 'serverRevision'=b.payload
 and d.project_id is not null and d.revision=1
 and d.payload->>'projectId'=d.project_id::text and (d.payload->>'serverRevision')::bigint=d.revision),
 'legacy ID, manuscript, metadata, asset references and timestamps survive backfill');
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',false);
select test_assert((select count(*)=1 from storage.objects),'legacy image still readable');
with changed as (update storage.objects set owner_id='overwritten-by-old-tab' returning *)
 select test_assert((select count(*)=0 from changed),'old tab must not overwrite legacy image');
with removed as (delete from storage.objects returning *)
 select test_assert((select count(*)=0 from removed),'old tab must not delete legacy image');
do $$ begin
 begin truncate public.epub_drafts; raise exception 'client can truncate manuscripts'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: legacy backfill and old-client image/write protection';
