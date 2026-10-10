-- Apply after approval migration. No storage deletion or image rewriting.
alter table public.epub_drafts add column project_id uuid not null default gen_random_uuid(),
  add column revision bigint not null default 1 check (revision > 0);
create unique index epub_drafts_project_identity on public.epub_drafts(owner_id, project_id);
update public.epub_drafts set payload = payload::jsonb || jsonb_build_object('projectId',project_id,'serverRevision',revision);
-- Old clients must fail closed: unconditional upserts would bypass revision CAS.
revoke insert, update, delete on public.epub_drafts from authenticated, anon;

create function private.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_revision bigint;
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_expected_revision < 0 or p_expected_revision is null
    or jsonb_typeof(p_payload->'chapters') is distinct from 'array' or coalesce(length(trim(p_payload->>'title')),0)=0 then
    raise exception 'Invalid project' using errcode='22023';
  end if;
  if p_expected_revision = 0 then
    begin
      insert into public.epub_drafts(owner_id,project_id,title,payload,revision,updated_at)
      values(v_owner,p_project_id,p_payload->>'title',p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',1),1,now())
      returning revision into v_revision;
    exception when unique_violation then raise exception 'Project conflict' using errcode='40001'; end;
  else
    update public.epub_drafts set title=p_payload->>'title',
      payload=p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',p_expected_revision+1),
      revision=revision+1,updated_at=now()
    where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision
    returning revision into v_revision;
    if not found then raise exception 'Project conflict' using errcode='40001'; end if;
  end if;
  return jsonb_build_object('revision',v_revision);
end; $$;
create function public.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb)
returns jsonb language sql security invoker set search_path = '' as $$
 select private.save_epub_project(p_project_id,p_expected_revision,p_payload);
$$;
create function private.delete_epub_project(p_project_id uuid,p_expected_revision bigint)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  delete from public.epub_drafts where owner_id=auth.uid() and project_id=p_project_id and revision=p_expected_revision;
  if not found then raise exception 'Project conflict' using errcode='40001'; end if;
end; $$;
create function public.delete_epub_project(p_project_id uuid,p_expected_revision bigint)
returns void language sql security invoker set search_path = '' as $$
 select private.delete_epub_project(p_project_id,p_expected_revision);
$$;
revoke all on function private.save_epub_project(uuid,bigint,jsonb), public.save_epub_project(uuid,bigint,jsonb),
 private.delete_epub_project(uuid,bigint),public.delete_epub_project(uuid,bigint) from public,anon;
grant execute on function private.save_epub_project(uuid,bigint,jsonb),public.save_epub_project(uuid,bigint,jsonb),
 private.delete_epub_project(uuid,bigint),public.delete_epub_project(uuid,bigint) to authenticated;
-- Immutable content paths can be inserted/read, never overwritten/deleted by clients.
create policy "Immutable project images update guard" on storage.objects as restrictive for update to authenticated
 using (bucket_id <> 'epub-assets' or split_part(name,'/',2) <> 'projects')
 with check (bucket_id <> 'epub-assets' or split_part(name,'/',2) <> 'projects');
create policy "Immutable project images delete guard" on storage.objects as restrictive for delete to authenticated
 using (bucket_id <> 'epub-assets' or split_part(name,'/',2) <> 'projects');
