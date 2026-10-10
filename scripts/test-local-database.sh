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
  "$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -1 -f "$migration" >/dev/null
done
"$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -f tests/database/isolation.sql
# Two independent connections both read revision 1; exactly one can commit 2.
for task_number in 1 2; do
  ("$PG_BIN/psql" -h "$TASK_DB_DIR" -p 55437 -d postgres -v ON_ERROR_STOP=1 -c "set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false); select save_epub_project('10000000-0000-4000-8000-000000000002',1,'{\"title\":\"concurrent-$task_number\",\"chapters\":[]}');" >"$TASK_DB_DIR/cas-$task_number.log" 2>&1 && echo pass >"$TASK_DB_DIR/cas-$task_number.result" || echo conflict >"$TASK_DB_DIR/cas-$task_number.result") &
done
wait
TASK_CAS_RESULTS=$(cat "$TASK_DB_DIR"/*.result | sort | tr '\n' ' ')
[ "$TASK_CAS_RESULTS" = 'conflict pass ' ] || { cat "$TASK_DB_DIR"/cas-*.log; exit 1; }
echo 'PASS: concurrent PostgreSQL connections permit exactly one CAS write'
