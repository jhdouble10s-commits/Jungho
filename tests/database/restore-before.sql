\set ON_ERROR_STOP on
do $$ begin
 if (select count(*) from epub_drafts) <> 1 then raise exception 'pre-migration backup row missing'; end if;
 if exists(select 1 from epub_drafts d join local_test.legacy_before b using(id) where to_jsonb(d)<>to_jsonb(b)) then raise exception 'restore changed legacy draft'; end if;
 if exists(select 1 from information_schema.columns where table_schema='public' and table_name='epub_drafts' and column_name='project_id') then raise exception 'unexpected new column in historical backup'; end if;
 if (select count(*) from storage.objects) <> 1 then raise exception 'storage metadata lost'; end if;
end $$;
select 'PASS: historical synthetic backup restored exactly; it lacks subsequent writes and is NOT a lossless rollback';
