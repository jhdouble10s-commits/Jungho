-- Manual saves replace the current server copy only for the approved owner
-- holding the exact, unexpired edit-lease generation. Legacy CAS RPCs remain.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create function private.overwrite_epub_project(
  p_project_id uuid,p_payload jsonb,p_client_id uuid,p_generation uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v_revision bigint; v_saved_at timestamptz;
begin
  if v_owner is null or not private.is_approved_member() then raise insufficient_privilege; end if;
  if p_project_id is null or p_client_id is null or p_generation is null
    or jsonb_typeof(p_payload->'chapters') is distinct from 'array'
    or coalesce(length(trim(p_payload->>'title')),0)=0 then
    raise exception 'Invalid project' using errcode='22023';
  end if;
  -- This locks the per-owner/project advisory key and the current lease row.
  -- Takeover, deletion, and every save therefore serialize on the same key.
  perform private.require_epub_project_edit_lock(p_project_id,p_client_id,p_generation);
  if exists (select 1 from public.epub_project_deletions
    where owner_id=v_owner and project_id=p_project_id) then
    raise sqlstate 'PT409' using message='Project deleted';
  end if;
  update public.epub_drafts set title=p_payload->>'title',
    payload=p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',revision+1),
    revision=revision+1,updated_at=clock_timestamp()
    where owner_id=v_owner and project_id=p_project_id
    returning revision,updated_at into v_revision,v_saved_at;
  if not found then
    begin
      insert into public.epub_drafts(owner_id,project_id,title,payload,revision,updated_at)
      values(v_owner,p_project_id,p_payload->>'title',
        p_payload || jsonb_build_object('projectId',p_project_id,'serverRevision',1),1,clock_timestamp())
      returning revision,updated_at into v_revision,v_saved_at;
    exception when unique_violation then
      raise sqlstate 'PT409' using message='Project identity or title already exists';
    end;
  end if;
  return jsonb_build_object('revision',v_revision,'saved_at',v_saved_at);
end; $$;

create function public.overwrite_epub_project(
  p_project_id uuid,p_payload jsonb,p_client_id uuid,p_generation uuid
) returns jsonb language sql security invoker set search_path = '' as $$
  select private.overwrite_epub_project(p_project_id,p_payload,p_client_id,p_generation);
$$;
revoke all on function private.overwrite_epub_project(uuid,jsonb,uuid,uuid),
  public.overwrite_epub_project(uuid,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function private.overwrite_epub_project(uuid,jsonb,uuid,uuid),
  public.overwrite_epub_project(uuid,jsonb,uuid,uuid) to authenticated;
notify pgrst, 'reload schema';
