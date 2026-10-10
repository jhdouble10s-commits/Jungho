# 기존 서버 전환 사전 점검 — 운영 미적용

대상: `htzojicodwueivybovhy` / sitescout / ap-southeast-1 / PostgreSQL 17.6.1.166. 확인 시각: 2026-10-10 00:38 UTC 전후.
후속 수정: 삭제 기록·부활 차단·저장 시각 반환과 schema cache 갱신 단계를 위 적용 후보에 통합했다. 아래 과거 검증 기록은 후속 수정의 운영 검증 결과가 아니다. 현재 환경에서는 Supabase 연결과 브라우저 실행이 제한돼 있어 재검증은 대기 중이다.
로컬: main, `6a36a02aff85448a9743e4f8e703660a837e23b1`. 시작 시 tracked diff 없음. 기존 미추적 파일 보존. 이번 작업은 커밋/푸시/Vercel 배포/운영 쓰기 없음.

## 1. 읽기 전용 운영 확인

- `https://sitescout-rosy.vercel.app/`의 ui.js, app-access.js, admin/admin.js, auth-client.js 응답 바이트가 기준 커밋의 로컬 파일과 일치. auth-client의 연결 대상도 지정 프로젝트와 일치.
- migration history: `20260928070521 allow_public_price_history_reads`, `20260929081455 create_epub_drafts_and_assets`, `20260929143503 add_user_profiles_for_username_auth`, `20261008115058 add_member_approval`.
- 로컬 프로필 migration 파일명은 `20260929150000`이나 운영은 `20260929143503`. 공백을 제거한 내용 MD5는 양쪽 `28c25b892440b63464781163ef6d6a0c`로 동일. approval도 `9956ce01b603c0458a398e56976daada`로 동일. 과거 migration 재실행/번호 강제 보정 금지. 관계없는 price_history는 수정 범위 밖.
- epub_drafts: 기존 UUID `id` PK, `owner_id default auth.uid()`, NOT NULL title/payload/created_at/updated_at, `UNIQUE(owner_id,title)`, 제목 1~200자 CHECK. **project_id/revision 및 세 RPC는 없음**.
- 원고 값/회원 목록을 조회하지 않고 집계만 검사: 기존 원고 1행, object payload와 chapters 배열, 기존 payload의 projectId/serverRevision 키 없음. 실제 본문/제목/자산 파일명/회원 개인정보는 가져오지 않음.
- epub_drafts/user_profiles/storage.objects RLS 활성. 원고 owner 일치, 승인 회원 restrictive 정책, 프로필 본인/승인 관리자 읽기 정책 유지. 실제 명시적 column ACL은 user_profiles.status의 authenticated UPDATE 하나. information_schema의 테이블 권한에서 파생된 column 표시를 별도 column grant로 오인하지 않음.
- epub-assets는 **private**. 사용자 ID 첫 경로, 승인 제한 존재. 역사적 이름이 `Draft owners can delete assets`인 Storage 정책은 실제로 ALL이므로 모든 변경 경로의 restrictive guard가 필요. MIME/크기 제한은 현재 null이며 이번에 임의 설정하지 않음.
- Auth INSERT trigger `sitescout_member_created` → private.create_member_profile: 일반 회원/user·pending 생성, metadata의 role/status 무시. 이메일 변경 동기화 trigger도 존재. 실제 함수 정의 확인.
- account-admin **버전 6**, ACTIVE, `verify_jwt=false`, artifact SHA-256 `47cbd699ee9ab0b2b91f40d71eb21eda71da090b42f299140fb88820bde4216d`. 소스가 이전 커밋 80c4cba와 완전히 동일. 함수 내부 getUser(token)+현재 DB admin/approved 검사는 이미 존재. 기존 코드는 status 직접 UPDATE, 새 코드는 호출자 JWT의 set_member_status RPC 및 suspended 처리. 게이트웨이 설정은 기존 값 유지하며 함수 내부 인증을 제거하지 않음.

## 2. 적용 후보와 계약 (아직 승인/적용 안 함)

| 파일 | SHA-256 |
| --- | --- |
| 20261009150031_atomic_project_saves.sql | 10741097843d8a4852c49af6ad9b34a119339f0206e9699a038d5ec4e253aaa2 |
| 20261009150447_member_status_transitions.sql | e42089d70ecbe543657be115fbc87f50a1bcecbf540c39f57f63d897defd3db0 |
| functions/account-admin/index.ts (6a36a02 소스 그대로) | a4374f6693c628b1636141e15c1c7dd5f570f5ff7529f8666714c9a650c9d343 |

첫 migration에 이번 사전 점검에서 **로컬 보완**: 모든 기존 epub-assets 경로의 UPDATE/DELETE 차단, 직접 draft TRUNCATE 권한도 회수. 기존 후보는 새 `/projects/` 경로만 보호해 구형 탭의 기존 이미지 overwrite가 로컬 SQL에서 재현됐다. 읽기/새 업로드의 owner·승인 정책은 유지. 두 migration에 lock_timeout 5초/statement_timeout 60초를 두어 장시간 대기 시 실패/중단하도록 함. 원고 내용·이미지 이동/삭제 없음.

- 각 기존 행에 새 UUID project_id, revision=1; 기존 id/owner/title/created_at/updated_at 유지. payload는 projectId/serverRevision 두 필드만 추가. 사용자+project_id UNIQUE 추가, 기존 owner+title UNIQUE 유지.
- `save_epub_project(p_project_id uuid,p_expected_revision bigint,p_payload jsonb) -> jsonb {revision,saved_at}`. expected=0 신규, 기존 revision 일치 시 갱신. 소유자·현재 승인 확인, 충돌 SQLSTATE 40001. 클라이언트는 localRevision과 별개로 서버 revision 관리.
- `delete_epub_project(p_project_id uuid,p_expected_revision bigint) -> void`. 현재 소유자/승인/revision 일치만 삭제하고 `epub_project_deletions(owner_id,project_id,revision,deleted_at)`에 명시적으로 기록. 이미지 삭제 없음. 삭제한 ID의 expected=0 재생성도 거부한다. 기록은 본인만 읽고 클라이언트 직접 변경은 차단한다.
- `set_member_status(p_user_id uuid,p_expected_status text,p_status text) -> jsonb {user_id,status}`. pending→approved/rejected, approved→suspended, rejected/suspended→approved. 현재 관리자 재확인, 동시 상태 변경 직렬화, 마지막 승인 관리자 보호. 역할 변경 API 없음.
- 일반 클라이언트의 직접 draft DML/TRUNCATE 및 status UPDATE 회수. private definer 함수에서 auth.uid()/현재 DB 상태를 검증하고 public invoker wrapper만 호출. 새로운 영구 관리 계정/토큰/키/권한 추가 없음.
- 기존 filename과 다른 migration 기록이 있으므로 **전체 db push 또는 history repair 금지**. 승인된 두 SQL만 명시적 대상에 적용. MCP apply_migration을 사용할 경우 도구가 실제 생성한 history version/name/content를 다시 기록하며 원래 파일번호가 그대로 기록됐다고 가정하지 않음.

## 3. 열린 탭/동기화 대기 원고 보존

1. 사용자가 각 기기·브라우저에서 local-only/syncPending/미저장 원고 존재와 EPUB 내보내기 가능 여부를 확인. 새로고침·로그아웃·캐시 삭제·프로젝트 자동 교체 금지.
2. 가능하면 현재 탭의 EPUB 내보내기 후 별도 안전한 사용자 폴더에 보관, 파일을 실제 열어 주요 장/표지 확인. 화면의 `저장`은 서버 업로드도 시도하므로 **로컬 전용 백업 버튼이라고 안내하지 않음**.
3. EPUB 실패 시 오류 이유(미복구 이미지, XHTML/각주 오류 등)를 먼저 확인. 원본 EPUB, 사용자 보유 이미지, 각 장 XHTML·공통 CSS·메타데이터를 별도 보관. 일부 텍스트만 복사한 것을 전체 프로젝트 백업으로 간주하지 않음.
4. 완전한 브라우저 백업이 필요하면 별도 승인 후 **해당 사용자만** projects/assets/workspace/recoveries/recoveryAssets를 내보내고 Blob 바이트/개수/참조를 검증해야 함. Auth 토큰·localStorage 비밀·다른 사용자 데이터는 제외. 현재 메모리의 미저장 변경은 IndexedDB 백업만으로 보장되지 않음. 내보내기 실패 원고가 안전하게 보존되지 않으면 유지보수 적용을 시작하지 않음.
5. 적용 후 새 클라이언트 재접속은 보존 확인 뒤 진행. syncPending은 자동 원격본 교체하지 않음. 새 저장본은 서버 revision=0으로 신규 저장, 과거 동일 제목 충돌은 원고 복사본을 보존하고 명시적으로 최신본/복구본을 비교. 실제 사용자 원고를 일괄 동기화하지 않음.

## 4. 백업 승인 범위와 복원 계획

**운영 백업은 아직 생성/다운로드/복원하지 않았다.** CLI 2.120.0 backups list는 AccessTokenRequiredError. Docker/기존 로컬 Supabase HTTP 스택/staging 자격 증명 없음. 기존 프로젝트의 development branch 목록도 0개로 확인했다. 기존 MCP 연결은 메타데이터 점검에 사용했고 그 인증정보를 추출하거나 새 PAT/API key를 만들지 않았다.

승인을 요청할 위치: `/Users/zhenghao/Library/Application Support/SiteScout/Backups/20261010-htzojicodwueivybovhy/` (OneDrive/Git 밖, 폴더 0700/파일 0600, 현재 OS 사용자 접근, 외부 업로드 없음). 실제 생성은 승인과 기존의 안전한 인증 수단 확보 후.

대상:
- 영향받는 DB 스키마·함수·정책·grants·migration 기록 + epub_drafts/user_profiles 데이터. 민감한 원고와 회원 이메일/이름이 포함될 수 있음. Auth 비밀번호/키는 추출하지 않음. 참조에 필요한 Auth ID를 포함하는 별도 로컬 검증 절차가 필요하며 전체 Auth credential 복제는 범위 밖.
- epub-assets 객체 바이트와 경로/크기/SHA-256 목록. DB 백업에는 **Storage 실제 파일이 포함되지 않음**. 이번 migration은 파일을 삭제/이동하지 않아도 복원 가능한 바이트 보존 여부를 별도로 확인.
- 현재 함수 소스/verify_jwt/import-map 메타데이터. 버전 6 소스는 이미 Git 80c4cba와 일치함을 확인. 기존 secret의 값은 로그/파일에 내보내지 않고 참조 이름/존재만 승인 범위 내 확인.
- 실제 backup을 별도 격리 DB에 복원, 원고·프로필·Storage 메타데이터 개수/전체 해시 및 제약/정책/RPC를 대조. Storage 바이트는 별도 해시 대조/격리 테스트가 필요. **백업 파일 존재만으로 복원 가능 판정 금지**.

CLI --help 확인 완료: backups list, functions deploy(--project-ref/--use-api/--no-verify-jwt), db dump, db query, migration list. 기존 인증을 로컬 보안 방식으로 제공해야 하며 비밀번호/토큰을 채팅에 보내지 말 것. CLI db dump는 Docker 의존성이 있어 현재 즉시 실행 불가. pg_dump/pg_restore 17.11은 있으나 운영 DB 접속 정보는 확보하지 않았음.

복구 원칙: SQL은 각각 트랜잭션 적용, 실패한 단계는 rollback하고 중단. 이미 성공한 migration의 project_id/revision/데이터와 새 저장은 유지. 과거 DB 전체 복원은 이후 저장/회원 변화를 잃으므로 기본 rollback이 아님. 먼저 쓰기를 멈추고 **현재 상태 추가 보존** 후 forward fix. 이전 함수 v6만 되돌리면 직접 status UPDATE 권한이 없어 정상 작동하지 않으므로 단독 함수 rollback/무조건 upsert 재허용 금지.

## 5. 유지보수와 적용 순서 — 승인 후에만

1. 위 탭 보존/접근 수단/백업 승인과 유지보수 시간 합의. 다른 사용자 공지는 사용자가 진행 (메시지 전송 도구 사용 없음).
2. 재점검: 대상 ref, schema/history/hash가 위와 다르면 중단하고 다시 확인. `operations/20261010_enter_maintenance.sql` 실행 승인 필요: 구형 draft 직접 쓰기·관리자 직접 승인 차단, Storage INSERT/UPDATE/DELETE 임시 차단. 읽기/내보내기/로컬 편집은 유지. 업로드 요청은 실패할 수 있고 이미 진행 중이던 요청이 끝나야 일관된 snapshot 가능.
3. 이 상태에서 승인된 운영 DB/Storage 백업 및 격리 복원 검증. 실패하면 migration 진행하지 않음. 임시 gate를 임의 해제하거나 구형 쓰기를 재허용하지 않음.
4. atomic_project_saves → member_status_transitions 적용. 실제 history와 schema/RPC/grants/RLS 및 삭제 기록을 확인. 첫 migration commit 이후 새 RPC 쓰기는 가능하므로 사용자 유지보수 중지 안내는 계속 유지; Storage 업로드는 임시 gate로 차단됨.
5. 동일 소스 account-admin 배포 (`verify_jwt=false`는 기존 설정 유지, 내부 getUser+DB admin 검증 필수). 원격 소스/새 버전/설정 확인. 기존 v6을 남긴 중간 상태는 정상 완료 아님.
6. Edge 배포 확인 후 `20261010_leave_storage_maintenance.sql`로 RPC signature/EXECUTE 권한과 삭제 기록 테이블을 검사하고 PostgREST schema cache 갱신을 요청한 뒤 임시 Storage gate만 해제. 영구 owner/승인/immutable 정책과 구형 DML 차단은 유지. 합성 HTTP 검증 동안 사용자는 계속 유지보수 상태 유지.
7. 승인받은 합성 계정 A/B/pending/rejected/admin 최대 5개, 프로젝트 최대 4개, 작은 이미지 최대 8개로 HTTP 신규저장·다른 세션 재열기·이미지·충돌·삭제 기록·revision 0 부활 차단·권한·상태 전이 검사. `PGRST202`가 남으면 연결 ref와 실제 migration history/RPC signature를 다시 대조하고 schema cache 응답을 확인한다. 다른 회원/프로젝트를 목록으로 수집하지 않고 테스트 ID만 명시적으로 사용. 계정 비밀번호/세션은 출력하지 않으며 테스트 외 영구 키/토큰 발급 없음.
8. 테스트 ID/prefix로만 생성 목록을 기록하여 합성 원고/객체/Auth 계정 정리 (각각 승인 필요). 실제 orphan 정리/기존 회원 데이터 삭제 금지. 마지막 관리자 조건을 만들려고 실제 관리자를 강등하지 않음; 해당 경계는 로컬에서만 검증.
9. 모든 결과 확인 후 사용자 재접속 허용, 각 사용자 로컬 동기화 대기본을 개별 확인. 기존 탭 강제 새로고침이나 전 사용자 일괄 업로드 없음.

중단 기준: 승인 범위/대상 불일치, 예상치 못한 ACL·정책·trigger, backup/복원 불일치, SQL timeout/error, 함수 버전 불일치, 합성 데이터 손실·격리 실패. 실패 후에도 현재 원고와 이미지 유지, 신규 RPC execute 회수/Storage gate 재설정 등 **쓰기 차단 조치는 구체적 상황을 설명하고 승인 범위 안에서만** 수행. 범위를 넓혀 정책을 해제하지 않음.

## 6. 검증 결과와 남은 조건

격리 SQL: 기존 원고 backfill 보존, 유지보수 읽기/쓰기 차단, 신규/수정/삭제/CAS, A/B 동일 제목 분리, 일반 사용자/타인 변경 차단, 가입 pending/user trigger, 승인/거절/정지/재승인/잘못된 전이/상태 CAS/마지막 관리자, 정지 기존세션 DB·Storage 제한, 기존 이미지 overwrite·delete 차단, dump/restore 후 해시 일치 통과. 이는 실제 PostgreSQL SQL 검사이고 Supabase HTTP 검사는 아님.

수정 전 재현: 구형 이미지 경로 UPDATE가 성공하여 새 cutover assertion 실패. 수정 후 동일 assertion 통과. 기존 DB 형태(id PK+owner/title UNIQUE+기본값/grants/ALL Storage 정책)를 반영한 합성 baseline이며 운영 데이터 복제본은 아님.

최종 재실행은 단위 64개·전체 브라우저 93개 통과. 운영에서는 읽기 전용 메타데이터와 공개 클라이언트 바이트만 확인. 실제 Auth 가입·Storage 업로드/다운로드·Edge HTTP 테스트는 환경/운영 합성 데이터 승인 전이라 미실행. 운영 백업도 아직 존재·복원 검증 안 됨. 따라서 **사전 점검·로컬 준비 완료, 운영 미적용/정상화 미확인**.

별도 정책: 미참조 이미지 GC, 회원 quota, MIME/크기, 계정 삭제 보관 기간. 비용·수치·보관 기간 임의 결정 없음. 이미 발급된 signed URL과 다운로드 사본 즉시 회수도 별도 제약.

공식 근거: [Supabase Backups](https://supabase.com/docs/guides/platform/backups), [Backup/Restore](https://supabase.com/docs/guides/self-hosting/restore-from-platform). DB 백업은 Storage 바이트를 포함하지 않으며 실제 복원은 별도 검증해야 함.


검사 기록(2026-10-10):
- `npm test`: 64 통과. `npm run verify:epub`: ZIP 32파일 SHA 동일, 26 spine/1 image/16 TOC 의미적 왕복 통과.
- `sh scripts/test-local-database.sh`: 유지보수→기존 데이터 전환→권한/CAS→합성 backup/restore 해시 비교까지 통과. PostgreSQL 17.11, Unix socket 전용 임시 클러스터이며 운영 접속 정보는 사용하지 않음.
- 첫 전체 Playwright: 92 통과/1 실패. 역순 저장 fixture가 프로젝트 로딩/비동기 이미지 준비 완료 전에 저장을 시작할 수 있었음. 해당 선행 조건을 DOM/상태 assertion으로 보강(기존 바이트/CAS assertion 유지), 단독 5회 연속 통과. 마지막 테스트 수정 후 전체 재실행은 93/93 통과(2.4분).
- 브라우저는 Supabase/AI를 mock하고 원래 CDN URL의 실제 응답 캐시를 사용한다. 테스트 준비 경합 수정 외 앱 UI/실행 코드는 변경하지 않았다.
- 구문 검사(`sh -n`, `node --check`) 및 `git diff --check` 통과. 별도 프로젝트 build/typecheck/lint 스크립트는 없음.
- 현재 운영 적용 승인 요청의 선행 조건: 사용자 탭 보존 확인, 민감 backup 파일 취급 승인, 기존 안전한 백업/DB 인증 수단 확보, 실제 운영 backup의 격리 복원 검증. 이 조건이 충족되지 않은 상태에서는 준비 문서만으로 운영 적용을 진행하지 않는다.

최종 로그: `/tmp/sitescout-preflight-final-{unit,browser,epub,db}.log`. 원인 재현: `/tmp/sitescout-cutover-before.log`; 반복 검증: `/tmp/sitescout-preflight-race-repeat.log`. `git diff --check` 최종 통과. Git HEAD와 운영 migration/function은 변경하지 않았다.
