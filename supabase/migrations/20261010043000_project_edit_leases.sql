-- Per-project edit leases.  This migration is intentionally fail-closed for
-- old save/delete RPC signatures: once deployed, a writer must prove both the
-- current lease generation and the revision it read.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table public.epub_project_edit_locks (
  owner_id uuid not null,
  project_id uuid not null,
  holder_id uuid not null,
  generation uuid not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (owner_id, project_id)
);
alter table public.epub_project_edit_locks enable row level security;
create policy "Owners can read their project edit leases" on public.epub_project_edit_locks
  for select to authenticated
  using ((select auth.uid()) = owner_id and (select private.is_approved_member()));
revoke insert, update, delete, truncate on public.epub_project_edit_locks from public, anon, authenticated;
grant select on public.epub_project_edit_locks to authenticated;

create function private.claim_epub_project_edit_lock(
  p_project_id uuid, p_client_id uuid, p_takeover boolean, p_ttl_seconds integer default 45
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid(); v_lock public.epub_project_edit_locks%rowtype;
  v_now timestamptz := clock_timestamp(); v_ttl integer := greatest(15, least(coalesce(p_ttl_seconds,45),120));
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_client_id is null then raise exception 'Invalid edit lease' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || ':' || p_project_id::text, 0));
  select * into v_lock from public.epub_project_edit_locks where owner_id=v_owner and project_id=p_project_id for update;
  v_now := clock_timestamp();
  if found and v_lock.expires_at > v_now and v_lock.holder_id <> p_client_id and not coalesce(p_takeover,false) then
    return jsonb_build_object('granted',false,'server_now',v_now,'expires_at',v_lock.expires_at);
  end if;
  if found and v_lock.expires_at > v_now and v_lock.holder_id = p_client_id then
    update public.epub_project_edit_locks set expires_at=v_now + make_interval(secs=>v_ttl),updated_at=v_now
      where owner_id=v_owner and project_id=p_project_id
      returning * into v_lock;
  else
    insert into public.epub_project_edit_locks(owner_id,project_id,holder_id,generation,expires_at,updated_at)
      values(v_owner,p_project_id,p_client_id,gen_random_uuid(),v_now + make_interval(secs=>v_ttl),v_now)
      on conflict (owner_id,project_id) do update set holder_id=excluded.holder_id,generation=excluded.generation,
        expires_at=excluded.expires_at,updated_at=excluded.updated_at
      returning * into v_lock;
  end if;
  return jsonb_build_object('granted',true,'generation',v_lock.generation,'server_now',v_now,'expires_at',v_lock.expires_at);
end; $$;

create function private.renew_epub_project_edit_lock(
  p_project_id uuid, p_client_id uuid, p_generation uuid, p_ttl_seconds integer default 45
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid(); v_lock public.epub_project_edit_locks%rowtype;
  v_now timestamptz := clock_timestamp(); v_ttl integer := greatest(15, least(coalesce(p_ttl_seconds,45),120));
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_client_id is null or p_generation is null then raise exception 'Invalid edit lease' using errcode='22023'; end if;
  update public.epub_project_edit_locks set expires_at=clock_timestamp() + make_interval(secs=>v_ttl),updated_at=clock_timestamp()
    where owner_id=v_owner and project_id=p_project_id and holder_id=p_client_id and generation=p_generation and expires_at > clock_timestamp()
    returning * into v_lock;
  if not found then raise sqlstate 'PT423' using message='Edit lease expired or transferred'; end if;
  v_now := clock_timestamp();
  return jsonb_build_object('granted',true,'generation',v_lock.generation,'server_now',v_now,'expires_at',v_lock.expires_at);
end; $$;

create function private.release_epub_project_edit_lock(
  p_project_id uuid, p_client_id uuid, p_generation uuid
) returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid();
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  -- A late tab may only release the exact generation it owns.  It can never
  -- erase a later transfer's lease.
  delete from public.epub_project_edit_locks
    where owner_id=v_owner and project_id=p_project_id and holder_id=p_client_id and generation=p_generation;
end; $$;

create function private.require_epub_project_edit_lock(p_project_id uuid,p_client_id uuid,p_generation uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid();
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || ':' || p_project_id::text, 0));
  perform 1 from public.epub_project_edit_locks
    where owner_id=v_owner and project_id=p_project_id and holder_id=p_client_id and generation=p_generation and expires_at > clock_timestamp()
    for update;
  if not found then raise sqlstate 'PT423' using message='Edit lease expired or transferred'; end if;
end; $$;

-- Old clients cannot bypass the lease after this migration.
create or replace function private.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin raise sqlstate 'PT423' using message='Edit lease required'; end; $$;
create or replace function private.delete_epub_project(p_project_id uuid,p_expected_revision bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin raise sqlstate 'PT423' using message='Edit lease required'; end; $$;

create function private.save_epub_project(
  p_project_id uuid,p_expected_revision bigint,p_payload jsonb,p_client_id uuid,p_generation uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_revision bigint; v_saved_at timestamptz;
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_expected_revision is null or p_expected_revision < 0 or p_client_id is null or p_generation is null
    or jsonb_typeof(p_payload->'chapters') is distinct from 'array' or coalesce(length(trim(p_payload->>'title')),0)=0 then
    raise exception 'Invalid project' using errcode='22023';
  end if;
  perform private.require_epub_project_edit_lock(p_project_id,p_client_id,p_generation);
  if p_expected_revision = 0 then
    if exists (select 1 from public.epub_project_deletions where owner_id=v_owner and project_id=p_project_id) then
      raise sqlstate 'PT409' using message='Project deleted';
    end if;
    begin
      insert into public.epub_drafts(owner_id,project_id,title,payload,revision,updated_at)
      values(v_owner,p_project_id,p_payload->>'title',p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',1),1,clock_timestamp())
      returning revision,updated_at into v_revision,v_saved_at;
    exception when unique_violation then raise sqlstate 'PT409' using message='Project conflict'; end;
  else
    update public.epub_drafts set title=p_payload->>'title',payload=p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',p_expected_revision+1),
      revision=revision+1,updated_at=clock_timestamp()
      where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision
      returning revision,updated_at into v_revision,v_saved_at;
    if not found then raise sqlstate 'PT409' using message='Project conflict'; end if;
  end if;
  return jsonb_build_object('revision',v_revision,'saved_at',v_saved_at);
end; $$;

create function private.delete_epub_project(
  p_project_id uuid,p_expected_revision bigint,p_client_id uuid,p_generation uuid
) returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid();
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_expected_revision is null or p_expected_revision < 1 or p_client_id is null or p_generation is null then
    raise exception 'Invalid deletion' using errcode='22023';
  end if;
  perform private.require_epub_project_edit_lock(p_project_id,p_client_id,p_generation);
  delete from public.epub_drafts where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision;
  if not found then raise sqlstate 'PT409' using message='Project conflict'; end if;
  insert into public.epub_project_deletions(owner_id,project_id,revision) values(v_owner,p_project_id,p_expected_revision+1);
end; $$;

create function public.claim_epub_project_edit_lock(p_project_id uuid,p_client_id uuid,p_takeover boolean,p_ttl_seconds integer default 45)
returns jsonb language sql security invoker set search_path = '' as $$ select private.claim_epub_project_edit_lock(p_project_id,p_client_id,p_takeover,p_ttl_seconds); $$;
create function public.renew_epub_project_edit_lock(p_project_id uuid,p_client_id uuid,p_generation uuid,p_ttl_seconds integer default 45)
returns jsonb language sql security invoker set search_path = '' as $$ select private.renew_epub_project_edit_lock(p_project_id,p_client_id,p_generation,p_ttl_seconds); $$;
create function public.release_epub_project_edit_lock(p_project_id uuid,p_client_id uuid,p_generation uuid)
returns void language sql security invoker set search_path = '' as $$ select private.release_epub_project_edit_lock(p_project_id,p_client_id,p_generation); $$;
create function public.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb,p_client_id uuid,p_generation uuid)
returns jsonb language sql security invoker set search_path = '' as $$ select private.save_epub_project(p_project_id,p_expected_revision,p_payload,p_client_id,p_generation); $$;
create function public.delete_epub_project(p_project_id uuid,p_expected_revision bigint,p_client_id uuid,p_generation uuid)
returns void language sql security invoker set search_path = '' as $$ select private.delete_epub_project(p_project_id,p_expected_revision,p_client_id,p_generation); $$;

revoke all on function private.claim_epub_project_edit_lock(uuid,uuid,boolean,integer),private.renew_epub_project_edit_lock(uuid,uuid,uuid,integer),private.release_epub_project_edit_lock(uuid,uuid,uuid),private.require_epub_project_edit_lock(uuid,uuid,uuid),private.save_epub_project(uuid,bigint,jsonb,uuid,uuid),private.delete_epub_project(uuid,bigint,uuid,uuid) from public,anon,authenticated;
revoke all on function public.claim_epub_project_edit_lock(uuid,uuid,boolean,integer),public.renew_epub_project_edit_lock(uuid,uuid,uuid,integer),public.release_epub_project_edit_lock(uuid,uuid,uuid),public.save_epub_project(uuid,bigint,jsonb,uuid,uuid),public.delete_epub_project(uuid,bigint,uuid,uuid) from public,anon;
-- These public SECURITY INVOKER wrappers need EXECUTE on their private targets.
-- The private schema is not exposed by PostgREST; each target still checks
-- auth.uid() and approved membership before it can touch a lease or draft.
grant execute on function private.claim_epub_project_edit_lock(uuid,uuid,boolean,integer),private.renew_epub_project_edit_lock(uuid,uuid,uuid,integer),private.release_epub_project_edit_lock(uuid,uuid,uuid),private.save_epub_project(uuid,bigint,jsonb,uuid,uuid),private.delete_epub_project(uuid,bigint,uuid,uuid) to authenticated;
grant execute on function public.claim_epub_project_edit_lock(uuid,uuid,boolean,integer),public.renew_epub_project_edit_lock(uuid,uuid,uuid,integer),public.release_epub_project_edit_lock(uuid,uuid,uuid),public.save_epub_project(uuid,bigint,jsonb,uuid,uuid),public.delete_epub_project(uuid,bigint,uuid,uuid) to authenticated;
