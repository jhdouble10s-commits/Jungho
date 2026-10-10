\set ON_ERROR_STOP on
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',false);
do $$ begin
 if (select count(*) from epub_drafts) <> 1 then raise exception 'maintenance blocked manuscript reads'; end if;
 if (select count(*) from storage.objects) <> 1 then raise exception 'maintenance blocked image reads'; end if;
 begin insert into storage.objects(bucket_id,name) values('epub-assets',auth.uid()::text||'/projects/new/image'); raise exception 'upload allowed during backup'; exception when insufficient_privilege then null; end;
 begin insert into epub_drafts(owner_id,title,payload) values(auth.uid(),'legacy fixture','{}') on conflict(owner_id,title) do update set payload=excluded.payload; raise exception 'old upsert allowed during maintenance'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: maintenance gates uploads and old direct writes while preserving reads';
