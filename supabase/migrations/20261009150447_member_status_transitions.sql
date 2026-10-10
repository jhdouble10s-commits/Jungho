set local lock_timeout = '5s';
set local statement_timeout = '60s';
alter table public.user_profiles drop constraint user_profiles_status_check;
alter table public.user_profiles add constraint user_profiles_status_check check(status in ('pending','approved','rejected','suspended'));
drop policy "Approved admins can decide pending members" on public.user_profiles;
revoke update(status) on public.user_profiles from authenticated;

create function private.set_member_status(p_user_id uuid,p_expected_status text,p_status text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare target public.user_profiles; caller public.user_profiles;
begin
  -- Serialises administrative transitions, including simultaneous last-admin
  -- suspension attempts. Permission is checked again AFTER acquiring the lock.
  perform pg_advisory_xact_lock(827364901);
  select * into caller from public.user_profiles where user_id=auth.uid();
  if caller.role is distinct from 'admin' or caller.status is distinct from 'approved' then raise insufficient_privilege; end if;
  select * into target from public.user_profiles where user_id=p_user_id for update;
  if not found or target.status is distinct from p_expected_status then raise exception 'Member conflict' using errcode='40001'; end if;
  if not ((target.status='pending' and p_status in ('approved','rejected'))
    or (target.status='approved' and p_status='suspended')
    or (target.status in ('rejected','suspended') and p_status='approved')) then
    raise exception 'Invalid status transition' using errcode='22023';
  end if;
  if target.role='admin' and target.status='approved' and p_status <> 'approved'
    and (select count(*) from public.user_profiles where role='admin' and status='approved') <= 1 then
    raise exception 'Last approved administrator must remain' using errcode='23514';
  end if;
  update public.user_profiles set status=p_status where user_id=p_user_id;
  return jsonb_build_object('user_id',p_user_id,'status',p_status);
end; $$;
create function public.set_member_status(p_user_id uuid,p_expected_status text,p_status text)
returns jsonb language sql security invoker set search_path = '' as $$
 select private.set_member_status(p_user_id,p_expected_status,p_status);
$$;
revoke all on function private.set_member_status(uuid,text,text),public.set_member_status(uuid,text,text) from public,anon;
grant execute on function private.set_member_status(uuid,text,text),public.set_member_status(uuid,text,text) to authenticated;
