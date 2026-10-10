# 로컬 안정화 검증 기록 (2026-10-09)

기준/시작 HEAD: `80c4cbae64baf2840a08f980a8dffc13e8caa512`, main. 시작 시 tracked diff 없음. 기존 HANDOFF.md, STABILIZATION.md, node_modules와 프롬프트 미추적 파일은 보존. 커밋·푸시·배포·운영 DB/Storage 조작 없음.

## 단계별 기록

1. 저장: 해시 계산을 지연시키면 `저장 중 새 입력`이 `저장 전`으로 돌아가는 브라우저 재현 실패 확인. await 이전에 owner/project/instance/revision/원고/자산 스냅샷을 확보하고 저장 변환의 canonical 되쓰기를 제거. 로컬 Dexie transaction 내부 revision 비교, 대상 프로젝트 단위 쓰기·삭제·복원, 이름 변경과 독립된 UUID, 서버 CAS RPC, immutable 이미지 경로, 충돌 시 로컬 복구본·원격 확인·복사본 UI 추가. 제목·저자·언어 input도 dirty/revision 반영.
2. 인증: 같은 사용자 Auth 이벤트마다 lock하던 경로 제거. 동시 focus/visibility/Auth 확인을 합치고 실제 identity 변경 시 generation 무효화/즉시 보호. 503은 기존 사용자별 로컬 초안 복구와 서버 작업 차단 유지.
3. 교정: 선택 장 일치 조건 때문에 B로 이동하면 A 결과를 버리던 경로 제거. 요청 owner/project/instance/chapter/sourceRevision/source/request ID, AbortController, 120초 timeout. 대상 A장의 이력에만 기록하고 현재 선택된 B장의 화면은 건드리지 않음. 대상 수정은 비교 결과 보존, 대상 삭제·프로젝트 교체·계정 변경은 취소. 한 번에 한 요청 유지.
4. 키: 전역 localStorage 키 읽기/쓰기 제거, 해당 레거시 항목만 삭제. 메모리/입력/요청 key 참조를 계정 변경·로그아웃에 지움. 비밀 아닌 프롬프트는 사용자별 저장. 탭 메모리 보관도 브라우저 확장/XSS에 대한 보안 경계라는 의미는 아님.
5. XHTML: Monaco HTML 기본 포맷 provider를 끄고 기존 vscode-html-languageservice(wrapLineLength:0)+보존 검사 provider 하나로 연결. 기본 Format Document/단축키/명령 팔레트/기존 액션 공통. Tiptap setContent에 preserveWhitespace:full 명시. 표 생성→포맷에서 이 옵션만 사용하면 들여쓰기 개행이 추가 셀/문단으로 변하는 것도 실제 브라우저로 재현했다. canonical XHTML은 그대로 두고, 동일한 엄격한 공백 판정으로 임시 Tiptap 입력에서 요소 전용 블록 컨테이너의 들여쓰기만 제외한다. 문단 내 공백/인라인 경계/보존 선언은 제외 대상이 아니다. 붙여넣기도 기존 ProseMirror DOMParser/DOMSerializer로 schema 왕복을 검사해 손실 위험 입력을 반영 전에 중단한다. 한글 IME 조합 완료 후 공통 직렬화 경로로 반영한다. 일반편집 출력은 DOM→XMLSerializer→XML 검증 후 canonical 반영. 문법·본문/공백·요소/속성 차이 안내 분리. ruby/SVG 등 실제 손실 위험 보호 유지. xml:space/pre/code/NBSP/white-space 선언은 보수적으로 보존.
6. 권한: 격리 PostgreSQL 17의 합성 auth/storage 기준 스키마 위에 실제 migration 적용. 실제 SQL role/RLS/트리거/CAS/정지·재승인/마지막 관리자 검사. Docker 부재로 전체 Supabase Auth/Storage HTTP 스택은 실행하지 않음. 따라서 운영 정책과 Auth 관리자 HTTP 동작을 이 결과로 보장하지 않음. Edge Function은 synthetic SDK mock으로 검증.
7. EPUBCheck에서 앱이 생성한 비선형 각주 문서에 접근 경로가 없는 기존 오류(OPF-096)를 발견했다. 생성 EPUB의 nav에 숨김 landmarks 링크를 추가해 페이지/본문/기존 TOC를 삭제하지 않고 해결했다. 가져온 EPUB의 nav/NCX는 보존한다.

## 서버 적용 대기 / 순서

1. 운영 백업·스키마 확인: 기존 epub_drafts owner/title unique, payload 타입, 테이블/컬럼 grants, user_profiles 제약 이름, Storage owner prefix 정책 확인. 이 저장소는 최초 epub_drafts/Storage DDL을 포함하지 않아 로컬 baseline은 합성 계약임.
2. 유지보수 창에서 오래된 클라이언트 저장을 중단하고 `20261009150031_atomic_project_saves.sql` 적용. 기존 행 UUID/revision backfill, 직접 DML revoke, 승인·소유자 재확인 definer(private)+invoker(public) CAS, immutable 경로 UPDATE/DELETE 차단.
3. `20261009150447_member_status_transitions.sql` 적용. pending→approved/rejected, approved→suspended, rejected/suspended→approved만 허용. 역할 변경 API 없음. 마지막 승인 관리자 정지 금지, 동시 관리자 상태 변경 advisory lock. 기존 JWT도 매 DB/Storage 요청의 현재 profile 상태로 차단. 정지해도 원고/이미지 삭제하지 않음. 이미 다운로드된 파일/발급된 signed URL의 즉시 철회는 별도 제약 확인 필요.
4. account-admin 함수와 클라이언트를 함께 배포. 현재는 승인받지 않아 실행하지 않음. 새 클라이언트는 RPC 부재 시 서버 저장을 실패시키고 로컬 저장을 유지하며 upsert fallback 없음. 구버전 클라이언트는 직접 DML 권한 취소로 저장 실패하므로 동시 사용하지 말 것.
5. 합성 staging 계정으로 신규가입 실제 Auth→trigger, 승인/정지/재승인, Storage HTTP 다운로드·중복 업로드, 두 브라우저 CAS, 이전 저장본 복원 재검증 후 업무용 사용.

복구: 스키마와 데이터 snapshot으로 별도 복구 계획/승인 후 롤백. 이미 생성된 project_id/revision/immutable 이미지와 payload는 삭제하지 않는다. 앱만 되돌리고 무조건 upsert 권한을 다시 열면 충돌 방지가 깨지므로 금지. 문제가 있으면 서버 쓰기를 중단하고 로컬 복구본·EPUB을 보존한다. 미참조 업로드 정리는 별도 job에서 DB 확정 참조와 진행 중 업로드/유예기간을 확인해야 하며 이번 작업은 정리를 실행하지 않음.

## 운영 결정 필요 (미적용)

- 유출 비밀번호 차단: Supabase Auth의 HaveIBeenPwned 기반 보호는 Pro 이상. 요금제와 비용 승인 필요. [공식 문서](https://supabase.com/docs/guides/auth/password-security)
- 파일 유형·크기: bucket allowedMimeTypes/fileSizeLimit 및 전역 상한으로 설정 가능. 허용 MIME 목록(SVG 포함 여부), 파일별 최대 MB를 사용자가 결정해야 함. [공식 문서](https://supabase.com/docs/guides/storage/buckets/creating-buckets)
- 회원별 용량: 단순 클라이언트 합계 검사는 동시 업로드를 제한하지 못함. 서버 예약량/확정량과 원자적 quota 검사가 필요. 회원별 MB/GB, 임시 업로드 포함 여부, 초과 시 읽기/쓰기 정책 결정 필요. 별도 저장공간/트래픽 비용 검토.
- 계정 삭제/이미지 GC: 즉시 삭제·유예일·백업 보관일·법적 보관 범위·복원 가능 기간을 결정해야 함. 계정 정지는 삭제와 별개. immutable 경로는 오래된 revision/진행 중 저장/다른 참조 여부를 확인한 관리자 작업만 정리 가능.

## 최종 검사 결과

마지막 코드/테스트 변경 후 아래 검사를 다시 실행했다. 이후에는 이 기록만 정리했다.

| 실행 | 결과 |
| --- | --- |
| `npm test` | 61 통과, 실패/skip 0. 패키지에 등록된 JS 구문 검사 포함 |
| `SITESCOUT_TEST_CDN_CACHE=/tmp/sitescout-test-cdn npm run test:browser` | 전체 93 통과, 실패/skip 0, 2.5분 |
| `npm run verify:epub` | ZIP 32 파일 SHA-256 동일, semantic 26 spine / 1 image / 16 TOC 통과 |
| `sh scripts/test-local-database.sh` | 실제 SQL role/RLS/가입 trigger/CAS/정지/재승인/마지막 관리자 통과. 독립 DB 연결 두 개의 경쟁에서 한 쓰기만 성공 |
| `node --check` | 변경 JS 및 신규 project-persistence/visual-xhtml, account-admin TypeScript 구문 통과 |
| `git diff --check` | 통과 |
| 빌드/별도 typecheck/lint | package.json에 해당 스크립트/설정이 없어 미실행. 구문 검사를 타입 검사라고 간주하지 않음 |

재현: 수정 전 해시 대기 중 본문이 과거 snapshot으로 돌아가는 테스트, 긴 p Format Document 후 일반편집이 잠기는 테스트에서 실제 실패 확인. 구현 중 표 생성→포맷→일반편집에서도 indentation이 추가 셀/문단이 되는 실패를 확인했고 현재 동일 경로가 통과한다. 모든 항목에 대해 수정 전 실패를 관측했다고 주장하지 않는다.

최종 브라우저 범위: 저장 중 입력/메타데이터/교정 완료/프로젝트 교체, 두 탭 local CAS와 Y 보존, 두 기기 server CAS/제목 변경/복사본, 역순 저장 응답과 immutable 바이트, 업로드/DB/마이그레이션 실패, 이전 local schema의 미동기화 원고 보존, 같은 사용자 세션 재확인, 503 복구/계정 격리, A 교정 중 B 편집과 A 충돌/취소/삭제/프로젝트 교체/timeout/잘못된 응답, 키/프롬프트 격리, 포맷 진입점/반복/undo, 붙여넣기/IME, 이전 보존·스타일·메뉴 회귀 포함.

### 실제 앱 출력 EPUB

브라우저가 실제 import/edit/save/reload/export 또는 paste/format/save/reload/export를 실행하고 다운로드 파일을 검사했다. `verify:epub`만으로 대체하지 않았다.

- `test-results/safe-format-format-entry-p-4d566-al-EPUB-output-preserve-XML/format-roundtrip.epub`: XML parsing, 자원/href 연결, `$1`, `$$`, `$&`, 금액 보존 통과.
- `test-results/data-safety-footnote-conte-49f21-gation-redo-save-and-reload/footnote-roundtrip.epub`: 각주 undo→장 이동→redo→저장→reload→export에서 본문 참조/내용 보존 통과.
- `test-results/data-safety-import-safe-ed-8fc75-spine-and-nested-anchor-TOC/preservation-roundtrip.epub`: ruby/SVG/section 속성, 달러 문자열, manifest/spine, 중첩 anchor nav, 교체 표지와 본문 이미지 바이트 보존 통과. 별도 NCX 왕복 테스트도 통과.
- 공식 EPUBCheck 5.4.0 + OpenJDK21 실행: `java -jar /tmp/sitescout-epubcheck/epubcheck-5.4.0/epubcheck.jar <각 파일>`.
- format/footnote 출력 두 개: 각각 **0 fatal / 0 error / 0 warning / 0 info**.
- preservation 출력: **3 error** — container version 누락, manifest scripted/svg 선언 누락. 같은 테스트가 보관한 `preservation-input.epub`는 이 세 오류와 dcterms:modified 누락을 포함한 **4 error**. 입력에서 이어진 규격 오류이며 출력 내용 보존 검사는 통과했다. 이 fixture를 EPUBCheck 통과로 보고하지 않는다.

로그: `/tmp/sitescout-final-all-{unit,browser,epub,db}.log`, `/tmp/sitescout-final-check-{format,footnote,input,import}.log`.

## 변경 파일과 OSS

- 원고/저장/교정/포맷 통합: `ui.js`, `book-project.js`, `project-persistence.js`, `cloud-asset-path.js`, `visual-xhtml.js`, `xhtml-validation.js`, `gemini-interactions.js`.
- 인증/관리: `app-access.js`, `auth-access.js`, `admin/admin.js`, `supabase/functions/account-admin/index.ts`, 위 migration 2개.
- 테스트: `tests/browser/save-races.spec.js`, `proofread-races.spec.js`, `safe-format.spec.js`, `project-cloud-fixture.js`, `cdn-cache.js` 신설. 기존 access-recovery/auth/data-safety/asset-shelf/editor-history/initial-ui/approved-session/ui-helpers와 관련 단위 테스트 보완. `scripts/test-local-database.sh`, `tests/database/{bootstrap,isolation}.sql` 신설.
- 기존 Dexie, Monaco, Tiptap/ProseMirror, vscode-html-languageservice, JSZip를 실제 실행 경로에서 재사용. 새로운 편집기/UI 라이브러리 없음. DOM/XMLSerializer는 브라우저 표준 API.
- 제거/대체: 사용자 전체 로컬 목록 삭제 후 재입력, 무조건 cloud upsert, 동일 이미지 경로 overwrite/저장 중 삭제, 전역 API key 저장, 선택 장이 다르다는 이유의 AI 결과 폐기, 경쟁하는 HTML 기본 포맷 경로, 일반편집 출력의 void-tag 정규식 단독 변환.
- 기존 CSS 프리셋/메뉴 애니메이션/sandbox 미리보기/각주 데이터 보존/표지·목차 왕복은 재작성하지 않고 회귀 검사했다.

## 검증 범위의 한계

- 모든 브라우저 인증/Storage/AI API는 합성 mock. 실제 회원·키·유료 AI 요청 없음. PostgreSQL 검사는 mock 판정이 아니라 실제 RLS/트리거/함수 실행이나, 최초 테이블/Storage 스키마는 저장소에 없어 합성 baseline이다.
- 공개 CDN 연결 reset/중단 때문에 최초 전체 실행은 통과하지 못했다. 최종 실행은 원래 요청 URL의 실제 응답 바이트를 `/tmp/sitescout-test-cdn`에 캐시했다. 버전/코드 대체 없음. 운영 CDN 가용성, 전체 Supabase HTTP 스택, 실제 메일 발송은 별도 검증 필요.
- 브라우저 출력에 기존 Monaco 모델 폐기 `Canceled` 및 native popover 중복 show 경고가 남는다. 관련 동작 assertions는 통과했지만 콘솔 오류가 전혀 없다고 보고하지 않는다.
- 대용량 ZIP 성능, 실제 하드웨어 IME/다양한 브라우저·기기, 운영 column-level grants와 Storage 설정은 미검증. 이미 발행한 signed URL 철회/파일 GC/회원 quota와 삭제 보관 정책은 이번 로컬 수정으로 보장하지 않는다.
- 파일 MIME/최대 크기·회원 quota의 강제 적용 및 공통 정책 validator는 수치/허용 목록 결정 후 추가 작업이다. 이번에 임의 제한을 도입하거나 운영 설정을 변경하지 않았다.
