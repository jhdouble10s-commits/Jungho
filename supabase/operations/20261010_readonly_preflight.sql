begin read only;
select jsonb_build_object(
'columns',(select jsonb_agg(jsonb_build_object('table',table_name,'column',column_name,'type',udt_name,'nullable',is_nullable,'default',column_default) order by table_name,ordinal_position) from information_schema.columns where table_schema='public' and table_name in ('epub_drafts','user_profiles')),
'constraints',(select jsonb_agg(jsonb_build_object('table',conrelid::regclass::text,'name',conname,'definition',pg_get_constraintdef(oid))) from pg_constraint where conrelid in ('public.epub_drafts'::regclass,'public.user_profiles'::regclass)),
'indexes',(select jsonb_agg(to_jsonb(i)) from (select tablename,indexname,indexdef from pg_indexes where schemaname='public' and tablename in ('epub_drafts','user_profiles')) i),
'rls',(select jsonb_agg(jsonb_build_object('table',oid::regclass::text,'enabled',relrowsecurity,'force',relforcerowsecurity)) from pg_class where oid in ('public.epub_drafts'::regclass,'public.user_profiles'::regclass,'storage.objects'::regclass)),
'policies',(select jsonb_agg(to_jsonb(p)) from (select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where (schemaname='public' and tablename in ('epub_drafts','user_profiles')) or (schemaname='storage' and tablename in ('objects','buckets'))) p),
'table_grants',(select jsonb_agg(to_jsonb(g)) from (select table_schema,table_name,grantee,privilege_type from information_schema.role_table_grants where table_schema in ('public','storage') and table_name in ('epub_drafts','user_profiles','objects') and grantee in ('PUBLIC','anon','authenticated','service_role')) g),
'column_grants',(select jsonb_agg(to_jsonb(g)) from (select table_schema,table_name,column_name,grantee,privilege_type from information_schema.role_column_grants where table_schema='public' and table_name in ('epub_drafts','user_profiles') and grantee in ('PUBLIC','anon','authenticated') and privilege_type in ('INSERT','UPDATE')) g),
'triggers',(select jsonb_agg(jsonb_build_object('table',tgrelid::regclass::text,'name',tgname,'enabled',tgenabled,'definition',pg_get_triggerdef(oid))) from pg_trigger where not tgisinternal and tgrelid in ('auth.users'::regclass,'public.user_profiles'::regclass,'public.epub_drafts'::regclass)),
'rpc',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'result',pg_get_function_result(p.oid),'definer',p.prosecdef,'acl',p.proacl,'config',p.proconfig)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.proname in ('save_epub_project','delete_epub_project','set_member_status','is_approved_member','is_approved_admin','handle_new_user')),
'deletion_table',to_regclass('public.epub_project_deletions')::text,
'deletion_read_grant',case when to_regclass('public.epub_project_deletions') is null then false else has_table_privilege('authenticated','public.epub_project_deletions','SELECT') end,
'rpc_execute',jsonb_build_object('save',case when to_regprocedure('public.save_epub_project(uuid,bigint,jsonb)') is null then false else has_function_privilege('authenticated','public.save_epub_project(uuid,bigint,jsonb)','EXECUTE') end,
 'delete',case when to_regprocedure('public.delete_epub_project(uuid,bigint)') is null then false else has_function_privilege('authenticated','public.delete_epub_project(uuid,bigint)','EXECUTE') end),
'recent_migrations',(select jsonb_agg(jsonb_build_object('version',version,'name',name) order by version desc)
  from (select version,name from supabase_migrations.schema_migrations order by version desc limit 10) migrations),
'bucket',(select jsonb_agg(jsonb_build_object('id',id,'public',public,'file_size_limit',file_size_limit,'allowed_mime_types',allowed_mime_types)) from storage.buckets where id='epub-assets')
) as metadata;
commit;
