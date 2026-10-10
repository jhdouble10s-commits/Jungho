-- Never run on a remote DB. Synthetic pre-CAS manuscript and image metadata.
insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000099','legacy@example.test');
update public.user_profiles set status='approved' where user_id='00000000-0000-4000-8000-000000000099';
insert into public.epub_drafts(id,owner_id,title,payload,created_at,updated_at) values(
 '20000000-0000-4000-8000-000000000099','00000000-0000-4000-8000-000000000099','legacy fixture',
 '{"title":"legacy fixture","chapters":[{"id":"legacy-chapter","originalPath":"Text/a.xhtml","xhtml":"<p>$1 $$ &amp; 한글</p>"}],"assets":[{"name":"old.png","originalPath":"Image/old.png"}],"custom":{"keep":true}}',
 '2026-01-01T00:00:00Z','2026-01-02T00:00:00Z');
insert into storage.objects(bucket_id,name) values('epub-assets','00000000-0000-4000-8000-000000000099/legacy-title/legacy-image');
create schema local_test;
create table local_test.legacy_before as select * from public.epub_drafts;
