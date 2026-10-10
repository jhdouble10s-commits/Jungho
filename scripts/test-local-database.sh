#!/bin/sh
# Uses a fresh Unix-socket-only PostgreSQL cluster. Never reads app env files.
set -eu
PG_BIN=${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}
TASK_DB_DIR=$(mktemp -d /tmp/sitescout-db.XXXXXX)
trap '"$PG_BIN/pg_ctl" -D "$TASK_DB_DIR/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$TASK_DB_DIR"' EXIT
"$PG_BIN/initdb" -D "$TASK_DB_DIR/data" -A trust >/dev/null
"$PG_BIN/pg_ctl" -D "$TASK_DB_DIR/data" -l "$TASK_DB_DIR/log" -o "-k $TASK_DB_DIR -c listen_addresses='' -p 55437" start >/dev/null
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/bootstrap.sql >/dev/null
for migration in supabase/migrations/*.sql; do
  case "$migration" in *20261009150031*)
    "$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/legacy-seed.sql >/dev/null
    "$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f supabase/operations/20261010_enter_maintenance.sql >/dev/null
    "$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/maintenance.sql
    "$PG_BIN/pg_dump" -h "$TASK_DB_DIR" -p 55437 -d postgres -Fc -f "$TASK_DB_DIR/before.dump"
  ;; esac
  "$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -1 -f "$migration" >/dev/null
done
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/maintenance.sql
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f supabase/operations/20261010_leave_storage_maintenance.sql >/dev/null
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/isolation.sql
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/cutover.sql
# Two independent connections both read revision 1; exactly one can commit 2.
for task_number in 1 2; do
  ("$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -c "set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false); select save_epub_project('10000000-0000-4000-8000-000000000002',1,'{\"title\":\"concurrent-$task_number\",\"chapters\":[]}');" >"$TASK_DB_DIR/cas-$task_number.log" 2>&1 && echo pass >"$TASK_DB_DIR/cas-$task_number.result" || echo conflict >"$TASK_DB_DIR/cas-$task_number.result") &
done
wait
TASK_CAS_RESULTS=$(cat "$TASK_DB_DIR"/*.result | sort | tr '\n' ' ')
[ "$TASK_CAS_RESULTS" = 'conflict pass ' ] || { cat "$TASK_DB_DIR"/cas-*.log; exit 1; }
echo 'PASS: concurrent PostgreSQL connections permit exactly one CAS write'
# Actual dump/restore rehearsal with SYNTHETIC rows only, in the same isolated
# cluster. Never restore a historical dump over the database accepting writes.
"$PG_BIN/createdb" -h "$TASK_DB_DIR" -p 55437 before_restore
"$PG_BIN/pg_restore" -h "$TASK_DB_DIR" -p 55437 -d before_restore --exit-on-error "$TASK_DB_DIR/before.dump"
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d before_restore -v ON_ERROR_STOP=1 -f tests/database/restore-before.sql
"$PG_BIN/pg_dump" -h "$TASK_DB_DIR" -p 55437 -d postgres -Fc -f "$TASK_DB_DIR/after.dump"
"$PG_BIN/createdb" -h "$TASK_DB_DIR" -p 55437 after_restore
"$PG_BIN/pg_restore" -h "$TASK_DB_DIR" -p 55437 -d after_restore --exit-on-error "$TASK_DB_DIR/after.dump"
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d after_restore -v ON_ERROR_STOP=1 -f tests/database/cutover.sql
for task_database in postgres after_restore; do
  "$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d "$task_database" -At -v ON_ERROR_STOP=1 -c "select md5(coalesce(jsonb_agg(to_jsonb(d) order by id)::text,'')) from epub_drafts d; select md5(coalesce(jsonb_agg(to_jsonb(p) order by user_id)::text,'')) from user_profiles p; select md5(coalesce(jsonb_agg(to_jsonb(o) order by id)::text,'')) from storage.objects o;" >"$TASK_DB_DIR/$task_database.hash"
done
cmp "$TASK_DB_DIR/postgres.hash" "$TASK_DB_DIR/after_restore.hash"
echo 'PASS: synthetic pre/post migration backups restored; drafts/profiles/storage-metadata hashes match'
