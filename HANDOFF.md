# HANDOFF

작성 기준: 2026-10-08, 실제 로컬 코드·Git·테스트 확인. 요구사항과 구현 상태를 구분한다. 이 문서 작성에서는 코드/설정/서버를 변경하지 않았다.

## 1. Project

- JH Studio: 브라우저 기반 EPUB 3 제작/편집 웹앱. non-React 정적 HTML + ES modules; npm build/dev 스크립트 없음. 주요 런타임 OSS는 CDN에서 로드하므로 인터넷 연결 필요.
- 실행: Node 20+ 환경에서 의존성 확인 후 `npm install`, `node scripts/serve-tests.mjs` → `http://127.0.0.1:4173`. `localhost`와 `127.0.0.1`은 브라우저 저장소가 서로 다름.
- 핵심 파일: `index.html`(기본 DOM/기존 inline style), `ui.js`(상태 연결·편집·EPUB·저장), `book-project.js`, `xhtml-{source,validation,tools}.js`, `chapter-hierarchy.js`, `gemini-{interactions,proofread}.js`, `sidebar.{js,css}`, `theme.{js,css}`, `theme-tooltip.js`.
- `login/index.html`, `supabase/functions/account-admin/`, `supabase/migrations/`에 인증 관련 코드가 있음. 정적 호스팅 가능 구조이나 추적된 Vercel 배포 설정/EPUBCheck CI는 확인되지 않음. 배포 성공 여부는 Git push와 별개.

## 2. Architecture / Canonical State

- `BookProject`가 chapter ID/선택/XHTML/dirty/revision의 canonical state. `selectedChapter`는 `selectedChapterId`로 조회. `body`는 `xhtml`의 비열거 getter/setter 호환 alias이며 별도 원문 캐시가 아님.
- 전체 프로젝트가 클래스에 완전히 통합된 상태는 아님: 책 메타데이터·CSS 입력 DOM, `previewAssets`, `importedEpub`, `footnotes`, 목차/파일명 보조 Map을 `ui.js`가 관리하고 `collectDraft()`에서 snapshot으로 모음.
- 선택은 ID가 기준. 다만 DOM `data-i`, `activeChapterIndex()`, `chapterAt()`, `chapterFileNames`, `parentTocMap`, `tocExcluded` 및 호환 `activeIndex`가 남음. `setCurrentChapter()`의 첫 DOM 행 fallback도 존재. index 의존 완전 제거라고 보고하지 말 것.
- `selectManagedChapter()` → 현재 buffer 보존 → 선택 ID 변경 → `setCurrentChapter()` → Monaco/Tiptap/Preview/글자수 갱신. 숨은 textarea는 editor bridge이며 독립 canonical copy로 확장 금지.
- Dexie는 snapshot/Blob persistence일 뿐 source of truth가 아님. 서버 동기화는 로컬 저장 후 별도 단계.
- EPUB import/export는 `ui.js`: JSZip + DOMParser로 container/OPF/NCX/nav 파싱, 원본 ZIP 파일 Map·manifest·spine·chapter metadata 보존. imported export와 신규 export 경로가 구분됨. EPUB2 → EPUB3/nav 변환 도메인 로직 유지.

## 3. Existing OSS / Dependencies

실제 호출 경로가 있는 주요 OSS(버전은 현재 코드/manifest 기준):

- JSZip 3.10.2: EPUB ZIP 읽기/쓰기. DOMPurify 3.4.16: Preview sanitize.
- Monaco 0.52.2 + emmet-monaco-es 5.7.0: XHTML/CSS 편집·자동완성(CDN).
- Tiptap 2.11.5 + extensions: 일반편집(CDN); source 속성 보존용 프로젝트 extension도 존재.
- Dexie 4.4.6: IndexedDB. ky 2.1.0: Supabase transport timeout/retry. Supabase JS 2.95.0: 인증·서버 원고/이미지 동기화(CDN).
- `diff` 9.0.0: 교정 결과 source edit 계산/자동수정 집계.
- `vscode-html-languageservice` 5.6.2 + `vscode-languageserver-textdocument` 1.0.12: XHTML formatting/AST/source 위치.
- Lucide 1.52.0: sidebar/이동된 toolbar 아이콘. Floating UI DOM 1.8.0: tooltip 배치. focus-trap 8.2.3: 모바일 sidebar focus.
- Playwright 1.63.0: browser E2E. `@xmldom/xmldom` 0.9.12: Node XML/semantic 검증. 런타임 XML parser는 브라우저 DOMParser.
- shadcn/React/dnd-kit/epub.js는 사용하지 않음. modal은 native `<dialog>`, submenu는 `<details>`; DnD는 기존 native/custom 구현 유지.
- maintained OSS·기존 dependency 재사용 우선, 동일 기능 custom+OSS 이중 구현 금지, React-only dependency 금지. Gemini 교정·프로젝트 state 연결·명시적 XHTML 자동수정은 예외. 모든 generic custom 구현의 OSS 전환이 완료된 것은 아님.

## 4. EPUB Data Safety

- `chapter.id`, `originalPath`, `xhtml`, `title`, `tocTitle`, `includeInToc`, hierarchy/order/spine, resource/image 경로와 대소문자, CSS, cover, internal href, footnote 링크를 보존.
- 일부 의미는 `tocExcluded`/`parentToc`/`level` 및 imported metadata로 표현됨. 모든 속성이 chapter 필드 하나에 통일되었다고 가정하지 말 것.
- 표지/장 추가·삭제·저장이 다른 본문을 재사용하거나 삭제해서는 안 됨. 목차 표시 재렌더 자체로 spine을 재정렬하지 않기.
- 렌더링만 `resolveResourceUrl()`/`hydrateResourceImages()`로 원래 경로 → asset/Blob URL 해석. canonical `src`를 blob URL로 바꾸지 않기. 프로젝트 교체 등의 URL 정리는 `clearPreviewAssets()` 경로 확인.

## 5. XHTML Rules

- canonical은 XHTML. Tiptap HTML은 UI 표현; 무변경 mode 왕복 시 재직렬화하지 않음. 사용자 편집만 `syncFromVisual()` → 빈 태그 보정 → chapter 반영.
- XHTML 진입/장 열기 때 `formatXhtmlMonacoForDisplay()`가 Microsoft language service formatter를 호출. 유효성 + `equivalentXhtml()` + chapter/model version/generation 확인 후 Monaco `executeEdits()` 적용.
- 이는 완전한 display-only 포맷이 아님: Monaco model과 canonical에 같은 포맷 결과가 반영됨. 본문/속성/inline 공백 의미 동일성 검사에 실패하면 포맷을 건너뜀. custom regex formatter 새로 만들지 말 것.
- `[XHTML 자동수정]`은 `fixXhtmlVoidElements()`로 모든 chapter를 독립 처리: br/hr/img/meta/link/input self-closing. 주석/CDATA/script/style 내부 제외, 정상 XHTML 유지, 잘못된 결과는 적용하지 않음.
- 저장/자동수정은 `validateXhtml()`의 XML fragment 기준 사용. invalid save 차단 및 line/column/parser 오류 표시. 저장 buffer는 Monaco latest value 우선.
- 별도의 기존 `normaliseXhtml()`(regex 전처리 + XMLSerializer)은 신규 export/Emmet 경로에 남아 있음. 자동수정 버튼과 같은 함수가 아니며 일반편집 저장용으로 확대하지 말 것.

## 6. Save / Persistence Rules

정상 경로: active Monaco/Tiptap 최신 내용 → selectedChapterId의 XHTML → BookProject → `collectDraft()` → 현재 project snapshot → Dexie transaction → 필요 시 서버.

- `saveCurrentChapter()`가 mode/chapter 전환 전 buffer 반영. `saveCurrentDraft()`는 임시저장/Ctrl·Cmd+S 공통; in-flight 중복 방지. 지속적인 타이핑 자동 Dexie 저장으로 오해하지 말 것.
- DB `epub-builder-projects`, Dexie schema v2: `projects`([ownerId+title]), `assets`([ownerId+title+name], Blob), `workspace`(ownerId별 마지막 프로젝트/빈 작업 선택). 프로젝트 키는 UUID가 아니라 계정+제목.
- `openSavedProject(title)`는 진행 중 저장을 기다린 후 Dexie 최신 record를 다시 읽음. 이전 row closure의 snapshot을 열지 않음. 현재 프로젝트/asset만 transaction으로 갱신하고 다른 원고를 덮어쓰지 않음.
- chapter buffer를 `chapters[0]`/firstChapter에 fallback 저장하거나 모든 장에 복제 금지. 저장 후 선택 ID 유지; restore epoch/revision/open generation·owner 검사 유지.
- 서버는 `epub_drafts`/`epub-assets`에 SDK upsert/upload. ky timeout 30초/total 90초/retry 최대 2. 로컬 저장/서버 성공/서버 실패 메시지 구분; 서버 실패 시 Dexie 데이터 유지.
- 서버 경로는 `supabaseUser`/`previewAssets`의 live 상태를 참조하는 부분이 남음. 계정·프로젝트 전환 중 upload 및 늦은 상태 메시지에 대한 완전한 stale 보호는 검증되지 않음.
- API 키·프롬프트·theme/layout preference는 localStorage에 별도 저장. 비밀 값은 snapshot/EPUB/문서/Git에 넣지 않기.

## 7. Cover / Default Chapters

- 새 프로젝트는 독립 ID의 `표지` → `각주 페이지`로 시작. `addSpecialChapter()`/새 EPUB handler 참조. 본문을 표지 슬롯으로 재사용하지 않음.
- 일반편집의 표지는 조건부 `.cover-read-only-view` 이미지 + 표지 선택/변경 버튼. 일반 장이나 XHTML 모드에서는 전용 DOM 제거. 책 정보 하단의 별도 표지 영역은 제거됨.
- Preview는 표지 선택 시 실제 이미지 렌더. XHTML이 있는 표지는 Monaco 표시/편집, 빈 표지는 read-only. 다른 장 선택 즉시 표지 view 해제.
- 기존 삭제 버튼 하나가 selected ID/type으로 표지·각주·일반 장 삭제. 표지 삭제는 cover 표시/metadata 제거와 해당 chapter 삭제만; 다음 본문 보호.
- 저장된 프로젝트 복원에는 누락된 표지/각주를 무조건 보충하지 않음. 빈 신규 앱 시작에는 기본 구조가 생성됨. 각주 추가 시 중앙 페이지 재생성은 아래 예외.

## 8. Footnote Architecture

- 생성 각주는 `footnotes` Map과 중앙 generated footnotes chapter로 관리. `synchronizeFootnotes()`가 본문 순서에 맞춰 번호/content/reference ID/href를 재생성.
- 본문 `epub:type="noteref"` → 중앙 `aside epub:type="footnote"` → 본문 backlink. `sourceChapterId`, `originalPath` 또는 `EPUB/text/fileName`의 상대 경로 + fragment ID 사용.
- `followBookLink()`가 앱 안에서 대상 장 선택/위치 이동. 여러 장의 생성 각주 지원; imported 각주는 별도 보존 경로이며 일괄 재번호 대상 아님.
- 본문 장 삭제 시 해당 sourceChapterId 각주만 제거. 중앙 페이지 삭제 시 생성 각주 Map을 비우고 생성 noteref를 정리. 이후 새 각주 삽입 시 중앙 페이지를 하나 재생성.
- DnD 뒤에도 ID/path 기반 링크 보존이 요구됨. 단일 각주 왕복/페이지 재생성은 E2E 있음; 다중 장 각주 편집·삭제·DnD 조합 전체 검증은 남음.

## 9. Editor Synchronization

- Monaco/Tiptap/Preview/글자수는 같은 selectedChapterId를 표시해야 함. editor cache를 독립 원문으로 만들지 않기.
- Tiptap: `suppressTiptapUpdate`, `visualLoadedChapterId`, `visualBaseline`, `setContent(..., false)`로 programmatic/user 변경 구분. CDN 로딩 전 host에 원문 fallback HTML을 넣지 않음(phantom text 원인).
- Monaco: `hydratingChapter`, `synchronising`, `loadXhtmlMonaco()`로 import/장 로딩이 이전 model을 저장하지 않도록 보호.
- 양방향 focus는 OSS HTML AST + 앱 ID → element path/동일 tag ordinal mapping. `focusSyncing`으로 feedback loop 방지; 매번 현재 source 기준 조회. 완전한 character source map/CFI는 아님.
- mapping 실패 시 현재 scroll/caret 유지; Preview bottom fallback 금지. selected ID 전환 시 이전 source 위치를 재사용하지 않기.

## 10. Preview

- 수동 갱신 버튼 없음. Monaco/Tiptap/CSS 변경은 `schedulePreview()`의 requestAnimationFrame 합치기 + 캡처한 chapter ID 검사. 선택/교정/자동수정/각주/이미지 경로는 직접 또는 input 경유 refresh.
- DOMPurify sanitize 후 Preview DOM만 갱신, 기존 scrollTop 보존, 공통 이미지 resolver 적용. iframe/epub.js paginator가 아닌 DOM Preview; 기기 프레임 크기 조절 지원.
- 렌더링 때문에 canonical XHTML 경로나 CSS 원문을 변경하지 말 것. 이미지 리소스 목록의 이미지 보기 기능은 일시적으로 Preview를 이미지 단독 표시하는 별도 동작이 있음.

## 11. Current UI Direction

- JH Studio + 주황색 원형 J. Sidebar: `EPUB MAKE → 프로젝트`, 하단 설정/계정. 240px/56px 접기, 모바일 drawer, 기존 preference 유지.
- 책 제목/저자/언어와 새 EPUB·EPUB 가져오기·EPUB3 내보내기가 동일 `.epub-topbar` 내부, 버튼 우측/세로 중앙 정렬 및 wrap. 첫 블럭 y=56px; 모바일은 drawer trigger 공간 포함 계산.
- 책의 구성 footer `[장 추가] [삭제]` 고정, 목록만 내부 scroll. 일반 장 추가는 선택 장 다음 sibling, 자동 스크롤 없음. Shift+좌/우 계층 이동은 editor/input focus 제외.
- 각주 삽입은 undo 뒤 Lucide icon. 편집블럭 하단 `[맞춤법 교정] [XHTML 자동수정]`, 우측 임시저장. 기존 handler 재사용; 미리보기 갱신/임시저장 전체 삭제 UI 없음.
- 설정 native dialog → API 설정 → 기존 API dialog. Light/Dark switch는 설정 내부, localStorage 유지. 중앙/외부 클릭 닫기/저장 성공 닫기·실패 유지.
- 공통 CSS Monaco 배경·gutter 통일, 해당 editor의 line highlight 없음. semantic light/dark token은 `theme.css`/`theme.js`; 기존 inline style이 많으므로 scoped override만 수정.

## 12. Known / Recent Bugs

Resolved 또는 회귀 테스트로 보호되는 범위:

- 현재 장 XHTML 저장/전환/reload 및 A/B/C 독립 내용, 저장 직후 현재 프로젝트 재열기: 최신 buffer + snapshot/record 재조회 경로로 수정.
- 일반편집 phantom/중복 paste: Tiptap host fallback 제거 및 programmatic/무변경 guard. 찬사 원문은 원본 EPUB의 실제 특정 장이며 앱 기본 문구가 아님.
- 표지 DOM 잔존·표지/각주 삭제 후 다른 장 보존, 모든 장 빈 태그 수정/invalid XHTML 저장 차단, 같은 문장 focus 구분 관련 E2E 존재.
- 최신 상단 액션 이동/56px/wrap 및 import/export, settings/sidebar/저장 재열기 회귀는 최근 browser 7개 PASS.

Unresolved / 제한(해결 완료로 보고 금지):

- index 보조 구조/fallback, custom DnD·일부 SVG/dropdown/utility·신규 export normalizer 남음. 완전한 OSS 통일/완전한 ID-only 전환 아님.
- Gemini 현재 모델 상수는 `gemini-3.5-flash-lite`, Interactions API. 문단 text/id만 보내고 correctedText JSON → 앱 diff/source edits. 약 6000자 문단 묶음별 호출, 잘린 JSON 거부.
- **현재 교정은 제안 패널에서 확인 후 적용이 아니라 accepted diff를 즉시 적용**. 검사 대상 보호에 chapterIndex가 남음. XHTML 모드 executeEdits는 사용하지만 일반편집 setContent의 undo 보존 및 늦은 응답/재정렬 조합은 추가 검증 필요. 과거 요청의 목표와 현 구현을 혼동하지 말 것.
- Tiptap 미지원 임의 XHTML의 무손실 편집, 모든 EPUB2/3 형태, 문자 단위 focus 정확성, Safari/Firefox, 실제 인증 서버 실패/retry 및 live Gemini 요청 미검증.
- 로컬 삭제는 서버 삭제가 아님. `restoreCloudDrafts()`가 접속 시 서버 원고를 다시 로컬에 병합. 최근 현재 Chrome localhost의 로컬 원고 24개·workspace 2개·구버전 이미지 1개 삭제/0개 확인했으나, 서버와 현재 메모리 목록은 유지했음. 다른 컴퓨터로 이 삭제가 전파되지 않음.
- 프로젝트 identity가 owner+제목이므로 제목 변경/충돌은 별도 주의. 새 컴퓨터에는 브라우저 로컬 원고·키·설정이 자동 이관되지 않음.

## 13. Regression / Scope Safety

- AGENTS.md 우선. 요청 범위만 수정; unrelated refactor/cleanup/rename, 전체 rewrite/formatter, global CSS(body/*/div) 수정 금지.
- 공통 함수/DOM id/data selector 수정 전 모든 caller/reference/state 영향 검색. 큰 innerHTML 재렌더·중복 listener 금지. 정상 기능과 UI를 함께 임의 변경하지 않기.
- selectedChapterId 단일 선택, index identity/첫 장 저장 fallback/모든 장 buffer 복제 금지. async는 project/chapter identity 캡처 후 stale 결과 폐기.
- 새 일반 기능은 OSS 후보와 실제 handler 연결 확인 후 최소 교체. 데이터 보존 도메인 로직을 라이브러리 부재만으로 삭제하지 않기.

## 14. Tests

- `npm test`: Node 단위 테스트 + ui/Gemini 문법 검사. 이번 문서 작성 시 **13 PASS**.
- `npm run verify:epub`: 이번 확인 **PASS** — 기도먼저.epub 32파일 SHA 동일, mimetype 첫 항목/STORED; 26 spine/1 image/16 TOC 의미 검증. 실제 앱 export 검증과 단순 JSZip round-trip을 혼동하지 않기.
- `npm run verify:epub -- source.epub exported.epub`: 두 파일의 semantic 비교. 구현은 `scripts/lib/epub-semantic.mjs`; CSS/cover/리소스·이미지 hash/TOC/spine/내부·각주 링크 검사.
- `npx playwright install chromium`, `npm run test:browser`: 별도 브라우저 프로필, 자동 테스트 서버. 최신 코드의 sidebar/workspace 7개는 이전 작업에서 PASS; 이번 문서 작업에서는 browser 전체 재실행하지 않음.
- `tests/browser/`: editor(A/B/C·reload), features(표지 삭제·각주 왕복·자동수정·paste/focus/DnD·실제 EPUB), draft-reset(복원/phantom), sidebar/theme/workspace(UI·저장 직후 재열기·자동 Preview). 서버는 fixture/mock이므로 실서버 검증 아님.
- `npm run verify:epubcheck -- book.epub`: 스크립트 존재, 현재 Java runtime 없음으로 실행 불가. Java 17+ 및 공식 JAR/lib 필요(`EPUBCHECK_JAR`, `docs/epubcheck.md`); 표준 검사이며 verify:epub 대체 아님.

## 15. Next Session Start

1. AGENTS.md → HANDOFF.md 읽기. 이 문서/현재 로컬 AGENTS 변경이 다른 컴퓨터에도 전달됐는지 확인.
2. `git status`, `git log -5 --oneline`, `git diff`로 실제 시작 상태 확인; 기존 사용자 변경 보존.
3. Node/npm 및 install 상태 확인 후 필요 시 `npm install`; 브라우저 검사는 Chromium 설치. 현재 node_modules 일부가 추적되므로 무조건 정리/삭제/일괄 stage 금지.
4. `npm test`, `npm run verify:epub` 실행. 필요한 작업은 관련 browser regression도 실행.
5. 요청 작업의 caller/state/DOM impact 검색. 첫 답변에서 현재 구현·unresolved issue·이번 영향 범위를 짧게 확인한 뒤 수정 시작.
6. 로컬 DB/키는 별도 컴퓨터로 복사되지 않음. Git에 비밀 값/브라우저 프로필을 넣지 않기. 서버 동기화 성공을 추정하지 말 것.

## 16. Git Handoff

- Branch: `main`
- HEAD: `77d1e7b8386193cdd28efa71a82758965a5ca12d` — Move EPUB actions into book information header
- 직전: `670480c` — Simplify EPUB workspace and stabilize project persistence
- 확인 시 `origin/main...HEAD` = 0/0, 직전 push 완료. 이번 문서의 commit/push는 수행하지 않음. **HANDOFF.md는 아직 다른 컴퓨터에서 pull할 수 없음. 전달/커밋·푸시가 별도로 필요.**
- 코드 변경 없음. 기존 dirty/untracked 상태는 유지. AGENTS.md의 Regression / Scope Safety 추가도 아직 미커밋임(핵심 규칙은 §13에 요약).
- Uncommitted files/paths(설치 산출물은 Git 기본 status의 디렉터리 단위 표기):

```text
AGENTS.md
HANDOFF.md
node_modules/.package-lock.json
STABILIZATION.md
spell_correction/프롬프트.md
node_modules/.bin/
node_modules/@floating-ui/
node_modules/@playwright/
node_modules/@vscode/
node_modules/focus-trap/
node_modules/lucide/
node_modules/playwright-core/
node_modules/playwright/
node_modules/tabbable/
node_modules/vscode-html-languageservice/
node_modules/vscode-languageserver-textdocument/
node_modules/vscode-languageserver-types/
node_modules/vscode-uri/
```
