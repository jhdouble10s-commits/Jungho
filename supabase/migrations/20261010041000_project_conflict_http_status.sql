-- Application-level CAS conflicts are expected outcomes, not retryable
-- serialization failures. PostgREST maps PT409 directly to HTTP 409.
create or replace function private.save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb)
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
    if exists (select 1 from public.epub_project_deletions where owner_id=v_owner and project_id=p_project_id) then
      raise sqlstate 'PT409' using message='Project deleted';
    end if;
    begin
      insert into public.epub_drafts(owner_id,project_id,title,payload,revision,updated_at)
      values(v_owner,p_project_id,p_payload->>'title',p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',1),1,now())
      returning revision,updated_at into v_revision,v_saved_at;
    exception when unique_violation then
      raise sqlstate 'PT409' using message='Project conflict';
    end;
  else
    update public.epub_drafts set title=p_payload->>'title',
      payload=p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',p_expected_revision+1),
      revision=revision+1,updated_at=now()
    where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision
    returning revision,updated_at into v_revision,v_saved_at;
    if not found then raise sqlstate 'PT409' using message='Project conflict'; end if;
  end if;
  return jsonb_build_object('revision',v_revision,'saved_at',v_saved_at);
end; $$;

create or replace function private.delete_epub_project(p_project_id uuid,p_expected_revision bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid();
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_expected_revision is null or p_expected_revision < 1 then
    raise exception 'Invalid deletion' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || ':' || p_project_id::text, 0));
  delete from public.epub_drafts where owner_id=v_owner and project_id=p_project_id and revision=p_expected_revision;
  if not found then raise sqlstate 'PT409' using message='Project conflict'; end if;
  insert into public.epub_project_deletions(owner_id,project_id,revision)
    values(v_owner,p_project_id,p_expected_revision+1);
end; $$;
