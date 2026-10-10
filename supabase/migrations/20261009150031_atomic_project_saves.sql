-- Apply after approval migration. No storage deletion or image rewriting.
set local lock_timeout = '5s';
set local statement_timeout = '60s';
alter table public.epub_drafts add column project_id uuid not null default gen_random_uuid(),
  add column revision bigint not null default 1 check (revision > 0);
create unique index epub_drafts_project_identity on public.epub_drafts(owner_id, project_id);
-- A deleted identity is never reusable, including by a stale revision-0 tab.
create table public.epub_project_deletions (
  owner_id uuid not null,
  project_id uuid not null,
  revision bigint not null check (revision > 0),
  deleted_at timestamptz not null default now(),
  primary key (owner_id, project_id)
);
alter table public.epub_project_deletions enable row level security;
create policy "Owners can read project deletions" on public.epub_project_deletions
  for select to authenticated using ((select auth.uid()) = owner_id and (select private.is_approved_member()));
grant select on public.epub_project_deletions to authenticated;
revoke insert, update, delete, truncate on public.epub_project_deletions from public, anon, authenticated;
update public.epub_drafts set payload = payload::jsonb || jsonb_build_object('projectId',project_id,'serverRevision',revision);
-- Old clients must fail closed: unconditional upserts would bypass revision CAS.
revoke insert, update, delete, truncate on public.epub_drafts from public, authenticated, anon;

create function private.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_revision bigint; v_saved_at timestamptz;
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_expected_revision < 0 or p_expected_revision is null
    or jsonb_typeof(p_payload->'chapters') is distinct from 'array' or coalesce(length(trim(p_payload->>'title')),0)=0 then
    raise exception 'Invalid project' using errcode='22023';
  end if;
  if p_expected_revision = 0 then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || ':' || p_project_id::text, 0));
    if exists (select 1 from public.epub_project_deletions
      where owner_id=v_owner and project_id=p_project_id) then
      raise exception 'Project deleted' using errcode='40001';
    end if;
    begin
      insert into public.epub_drafts(owner_id,project_id,title,payload,revision,updated_at)
      values(v_owner,p_project_id,p_payload->>'title',p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',1),1,now())
      returning revision,updated_at into v_revision,v_saved_at;
    exception when unique_violation then raise exception 'Project conflict' using errcode='40001'; end;
  else
    update public.epub_drafts set title=p_payload->>'title',
      payload=p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',p_expected_revision+1),
      revision=revision+1,updated_at=now()
    where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision
    returning revision,updated_at into v_revision,v_saved_at;
    if not found then raise exception 'Project conflict' using errcode='40001'; end if;
  end if;
  return jsonb_build_object('revision',v_revision,'saved_at',v_saved_at);
end; $$;
create function public.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
 select private.save_epub_project(p_project_id,p_expected_revision,p_payload);
$$;
create function private.delete_epub_project(p_project_id uuid,p_expected_revision bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid();
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_expected_revision is null or p_expected_revision < 1 then
    raise exception 'Invalid deletion' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || ':' || p_project_id::text, 0));
  delete from public.epub_drafts where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision;
  if not found then raise exception 'Project conflict' using errcode='40001'; end if;
  insert into public.epub_project_deletions(owner_id,project_id,revision)
    values(v_owner,p_project_id,p_expected_revision+1);
end; $$;
create function public.delete_epub_project(p_project_id uuid,p_expected_revision bigint)
returns void language sql security invoker set search_path = '' as $$
 select private.delete_epub_project(p_project_id,p_expected_revision);
$$;
revoke all on function private.save_epub_project(uuid,bigint,jsonb), public.save_epub_project(uuid,bigint,jsonb),
 private.delete_epub_project(uuid,bigint),public.delete_epub_project(uuid,bigint) from public,anon;
grant execute on function private.save_epub_project(uuid,bigint,jsonb),public.save_epub_project(uuid,bigint,jsonb),
 private.delete_epub_project(uuid,bigint),public.delete_epub_project(uuid,bigint) to authenticated;
-- Protect legacy paths too: stale tabs may upload to those paths BEFORE their
-- direct draft write fails. Reads/inserts stay subject to existing ownership
-- and approval policies; obsolete blobs require separate server-side GC.
create policy "Immutable project images update guard" on storage.objects as restrictive for update to authenticated
 using (bucket_id <> 'epub-assets')
 with check (bucket_id <> 'epub-assets');
create policy "Immutable project images delete guard" on storage.objects as restrictive for delete to authenticated
 using (bucket_id <> 'epub-assets');
