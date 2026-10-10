\set ON_ERROR_STOP on
create function public.test_assert(ok boolean, message text) returns void language plpgsql as $$ begin if ok is not true then raise exception 'ASSERT: %',message; end if; end; $$;
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000000001','a@example.test','{"role":"admin","status":"approved"}'),
 ('00000000-0000-4000-8000-000000000002','b@example.test','{}'),
 ('00000000-0000-4000-8000-000000000003','pending@example.test','{}'),
 ('00000000-0000-4000-8000-000000000004','rejected@example.test','{}'),
 ('00000000-0000-4000-8000-000000000005','admin@example.test','{}');
select test_assert((select count(*)=5 from user_profiles where status='pending' and role='user'),'real signup trigger ignores injected metadata');
update user_profiles set status='approved' where user_id in ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000005');
update user_profiles set role='admin' where user_id='00000000-0000-4000-8000-000000000005';
update user_profiles set status='rejected' where user_id='00000000-0000-4000-8000-000000000004';
set role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
select save_epub_project('10000000-0000-4000-8000-000000000001',0,'{"title":"same","chapters":[],"assets":[]}');
insert into storage.objects(bucket_id,name) values('epub-assets','00000000-0000-4000-8000-000000000001/projects/10000000-0000-4000-8000-000000000001/hash-a');
do $$ begin
 begin perform save_epub_project('10000000-0000-4000-8000-000000000001',0,'{"title":"same","chapters":[]}'); raise exception 'CAS allowed stale insert'; exception when serialization_failure then null; end;
 begin update user_profiles set role='admin'; raise exception 'role escalation'; exception when insufficient_privilege then null; end;
 begin perform set_member_status('00000000-0000-4000-8000-000000000001','approved','suspended'); raise exception 'user called admin RPC'; exception when insufficient_privilege then null; end;
 begin update epub_drafts set owner_id='00000000-0000-4000-8000-000000000002'; raise exception 'direct update'; exception when insufficient_privilege then null; end;
 begin insert into epub_drafts(owner_id,title,payload) values(auth.uid(),'bypass','{}'); raise exception 'direct insert/upsert'; exception when insufficient_privilege then null; end;
 begin delete from epub_drafts; raise exception 'direct delete'; exception when insufficient_privilege then null; end;
end $$;
select save_epub_project('10000000-0000-4000-8000-000000000001',1,'{"title":"renamed","chapters":[]}');
do $$ begin
 begin perform save_epub_project('10000000-0000-4000-8000-000000000001',1,'{"title":"stale","chapters":[]}'); raise exception 'CAS stale update'; exception when serialization_failure then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false);
select test_assert((select count(*)=0 from epub_drafts),'B cannot read A');
select test_assert((select count(*)=0 from storage.objects),'B cannot read A images');
select save_epub_project('10000000-0000-4000-8000-000000000002',0,'{"title":"renamed","chapters":[]}');
do $$ begin
 begin perform delete_epub_project('10000000-0000-4000-8000-000000000001',2); raise exception 'B deleted A'; exception when serialization_failure then null; end;
 begin perform save_epub_project('10000000-0000-4000-8000-000000000001',2,'{"title":"attack","chapters":[]}'); raise exception 'B updated A'; exception when serialization_failure then null; end;
 begin insert into storage.objects(bucket_id,name) values('epub-assets','00000000-0000-4000-8000-000000000001/stolen'); raise exception 'B inserted A image'; exception when insufficient_privilege then null; end;
end $$;
with changed as (update storage.objects set owner_id=auth.uid()::text where name like '00000000-0000-4000-8000-000000000001/%' returning *) select test_assert((select count(*)=0 from changed),'B cannot change A image owner');
with removed as (delete from storage.objects where name like '00000000-0000-4000-8000-000000000001/%' returning *) select test_assert((select count(*)=0 from removed),'B cannot delete A images');
do $$ begin
 begin insert into storage.objects(bucket_id,name) values('epub-assets','00000000-0000-4000-8000-000000000001/projects/10000000-0000-4000-8000-000000000001/hash-a') on conflict(bucket_id,name) do update set owner_id=auth.uid()::text; raise exception 'B upserted A image'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000004',false);
do $$ begin
 begin perform save_epub_project(gen_random_uuid(),0,'{"title":"rejected","chapters":[]}'); raise exception 'rejected save'; exception when insufficient_privilege then null; end;
 begin insert into storage.objects(bucket_id,name) values('epub-assets',auth.uid()::text||'/rejected'); raise exception 'rejected upload'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',false);
do $$ begin
 begin perform save_epub_project(gen_random_uuid(),0,'{"title":"pending","chapters":[]}'); raise exception 'pending save'; exception when insufficient_privilege then null; end;
 begin update user_profiles set status='approved' where user_id=auth.uid(); raise exception 'self approval'; exception when insufficient_privilege then null; end;
 begin insert into storage.objects(bucket_id,name) values('epub-assets',auth.uid()::text||'/pending'); raise exception 'pending upload'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',false);
select set_member_status('00000000-0000-4000-8000-000000000003','pending','rejected');
do $$ begin
 begin perform set_member_status('00000000-0000-4000-8000-000000000003','pending','approved'); raise exception 'stale approval allowed'; exception when serialization_failure then null; end;
end $$;
select set_member_status('00000000-0000-4000-8000-000000000003','rejected','approved');
do $$ begin
 begin perform set_member_status('00000000-0000-4000-8000-000000000003','approved','rejected'); raise exception 'invalid transition allowed'; exception when invalid_parameter_value then null; end;
end $$;
select set_member_status('00000000-0000-4000-8000-000000000001','approved','suspended');
do $$ begin
 begin perform set_member_status(auth.uid(),'approved','suspended'); raise exception 'last admin suspended'; exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
select test_assert((select count(*)=0 from epub_drafts),'old JWT loses DB access after suspension');
select test_assert((select count(*)=0 from storage.objects),'old JWT loses image access after suspension');
do $$ begin
 begin perform save_epub_project('10000000-0000-4000-8000-000000000001',2,'{"title":"suspended","chapters":[]}'); raise exception 'suspended save'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000005',false);
select set_member_status('00000000-0000-4000-8000-000000000001','suspended','approved');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);
select test_assert((select count(*)=1 from epub_drafts),'reapproval retains draft');
with changed as (update storage.objects set name=name||'-changed' returning *) select test_assert((select count(*)=0 from changed),'immutable image update refused');
with removed as (delete from storage.objects returning *) select test_assert((select count(*)=0 from removed),'immutable image delete refused');
select save_epub_project('10000000-0000-4000-8000-000000000088',0,'{"title":"delete fixture","chapters":[]}');
select delete_epub_project('10000000-0000-4000-8000-000000000088',1);
select test_assert((select count(*)=0 from epub_drafts where project_id='10000000-0000-4000-8000-000000000088'),'own revision-checked deletion works');
reset role;
select 'PASS: signup, ownership, CAS, immutable assets, transitions, last admin and existing-session RLS';
