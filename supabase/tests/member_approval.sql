-- Run on the linked project using execute_sql/psql. Everything is rolled back.
begin;
insert into auth.users (id, email, raw_user_meta_data, created_at)
values
  ('00000000-0000-4000-8000-000000000a01', 'approval-regression-1@example.invalid', '{"display_name":"jungho","role":"admin","status":"approved"}', now()),
  ('00000000-0000-4000-8000-000000000a02', 'approval-regression-2@example.invalid', '{"display_name":"회원"}', now());
do $$ begin
  if not exists (select 1 from public.user_profiles where user_id = '00000000-0000-4000-8000-000000000a01'
      and role = 'user' and status = 'pending' and username is null) then
    raise exception 'signup must force pending/user despite spoofed metadata';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000a01","role":"authenticated"}', true);
do $$ declare affected integer; begin
  if private.is_approved_member() or private.is_approved_admin() then raise exception 'pending got access'; end if;
  if (select count(*) from public.user_profiles) <> 1 then raise exception 'member list leaked'; end if;
  update public.user_profiles set status = 'approved' where user_id = '00000000-0000-4000-8000-000000000a01';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'self approval allowed'; end if;
  begin
    update public.user_profiles set role = 'admin' where user_id = '00000000-0000-4000-8000-000000000a01';
    raise exception 'role escalation allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.epub_drafts (owner_id, title) values ('00000000-0000-4000-8000-000000000a01', 'approval regression');
    raise exception 'pending draft insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects (bucket_id, name) values ('epub-assets', '00000000-0000-4000-8000-000000000a01/regression.png');
    raise exception 'pending asset insert allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims', '{"sub":"eb205327-3994-46f0-b392-58c435c7e644","role":"authenticated"}', true);
do $$ declare affected integer; begin
  if not private.is_approved_admin() then raise exception 'verified jungho lost admin access'; end if;
  if (select count(*) from public.user_profiles where user_id in ('00000000-0000-4000-8000-000000000a01','00000000-0000-4000-8000-000000000a02')) <> 2 then
    raise exception 'admin cannot list pending members';
  end if;
  update public.user_profiles set status = 'approved' where user_id = '00000000-0000-4000-8000-000000000a01';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'approval failed'; end if;
  update public.user_profiles set status = 'rejected' where user_id = '00000000-0000-4000-8000-000000000a02';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'rejection failed'; end if;
end $$;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000a01","role":"authenticated"}', true);
do $$ declare affected integer; begin
  if not private.is_approved_member() or private.is_approved_admin() then raise exception 'approved user has wrong access'; end if;
  insert into public.epub_drafts (owner_id, title) values ('00000000-0000-4000-8000-000000000a01', 'approval regression');
  update public.epub_drafts set payload = '{"test":true}' where title = 'approval regression';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'approved owner cannot update draft'; end if;
  insert into storage.objects (bucket_id, name) values ('epub-assets', '00000000-0000-4000-8000-000000000a01/regression.png');
  update public.user_profiles set status = 'approved' where user_id = '00000000-0000-4000-8000-000000000a02';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'normal user approved another user'; end if;
  begin
    update public.user_profiles set user_id = '00000000-0000-4000-8000-000000000a02';
    raise exception 'identity mutation allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000a02","role":"authenticated"}', true);
do $$ begin
  if private.is_approved_member() then raise exception 'rejected got access'; end if;
  if exists (select 1 from public.epub_drafts) then raise exception 'rejected read drafts'; end if;
  if exists (select 1 from storage.objects where bucket_id = 'epub-assets') then raise exception 'rejected read assets'; end if;
end $$;
reset role;
rollback;
select 'PASS: signup defaults, spoofing, self escalation, admin approval/rejection, draft/asset RLS, ordinary user denial; all fixtures rolled back' as result;
