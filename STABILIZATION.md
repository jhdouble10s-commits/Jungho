# 안정화 작업 기록

## 실제 Chrome 저장본 초기화 후속 수정

사용자 승인 후 실제 `localhost:4173` Chrome 프로필에서 현재 원고, 로컬/현재 계정의 Dexie 임시저장 원고·첨부 이미지, 로그인 계정의 서버 `epub_drafts` 및 `epub-assets` 계정 prefix를 삭제했다. 서버는 삭제 응답 오류 및 재조회 잔존 여부를 확인하고, 브라우저는 새로고침 뒤 `임시저장본 없음`, 새 일반 장 두 개의 `글자 수 0자`를 확인했다. 원본 EPUB 파일과 API 키는 건드리지 않았다. 삭제한 저장본은 앱에서 복구할 수 없다.

- 이전 검증은 새로 생성한 테스트 프로필 및 `.ProseMirror` 내부를 주로 확인해 실제 프로필의 자동 복원/일반편집 host 바깥 잔존 가능성을 놓쳤다.
- 원인 1: 새 책은 메모리만 초기화했으며 다음 접속에서 가장 최근 저장본을 다시 열었다. Dexie `workspace` 저장소에 빈 작업/선택 저장본을 기록해 빈 새 책에서 reload해도 과거 원고를 열지 않는다.
- 원인 2: 비동기 Tiptap 설치 전 host에 넣은 임시 HTML은 Tiptap이 만든 문서 밖에 남을 수 있었다. 임시 HTML 주입/역직렬화 fallback을 제거하고 Tiptap mount 전 host를 비운다.
- 전체 삭제는 기존 Dexie/Supabase SDK로 처리한다. 이미 진행 중인 저장을 기다리고, 늦은 복원 응답을 epoch로 무효화하며, 현재 계정 밖의 서버 데이터는 삭제하지 않는다. 서버 오류를 무시하고 삭제 성공으로 표시하던 개별 삭제 경로도 수정했다.
- 회귀 검사 추가: Tiptap 다운로드를 의도적으로 지연 → 저장 원고 복원 → host 전체 DOM 확인 → 새 책/두 장 추가/reload → 전체 삭제 → Dexie 원고·이미지 0개 및 API 키 유지 확인.
- 후속 변경 파일: ui.js, index.html, tests/browser/draft-reset.spec.js, 이 문서. 새 dependency 없음.
- SDK 삭제 방식은 [Supabase delete](https://supabase.com/docs/reference/javascript/delete), [Storage remove](https://supabase.com/docs/reference/javascript/storage-from-remove)를 확인해 오류 처리와 소유자 필터를 유지했다. Supabase 스킬에 따라 권한/RLS 변경이나 관리자 키 사용 없이 현재 로그인 계정 범위에서 처리했다.

## 기능별 조사와 실제 경로

| 기능 | 구현 / OSS 후보 | 실제 사용 경로 / 조치 |
| --- | --- | --- |
| EPUB ZIP | JSZip 3.10.2 | import → loadAsync / export → generateAsync 유지 |
| Preview sanitize | DOMPurify 3.4.16 | refreshPreview → sanitize 유지 |
| XHTML 편집 / 자동완성 | Monaco / Emmet | 기존 editor와 Emmet 유지; 중복 custom 자동 닫기 제거 |
| 일반편집 | Tiptap 2.11.5 | setContent/onUpdate 경계 보호; custom paste·문단 정리 fallback 제거 |
| 저장 | Dexie 4.4.6 | 현재 ID의 editor buffer → BookProject → snapshot → transaction 완료 대기 |
| 포맷 / source 위치 | Microsoft vscode-html-languageservice 5.6.2 (MIT) | formatXhtml → service.format, sourceElements → parseHTMLDocument; 새 regex formatter 없음 |
| 문서 편집 자료형 | vscode-languageserver-textdocument 1.0.12 (MIT) | formatter 결과 → TextDocument.applyEdits |
| XHTML 유효성 | 브라우저 DOMParser | 저장·export·자동수정에서 XML parser 오류 검사; line/column 표시 |
| XHTML 빈 태그 수정 | 기존 targeted custom 예외 | 각 chapter 독립 적용, comments/CDATA/script/style 제외 |
| 툴바 아이콘 | Lucide 1.52.0 (ISC) | 인용/표/행/열 4개 SVG → createElement; 나머지 아이콘은 미전환 |
| API 설정 | native dialog | showModal/close 유지; 새 UI framework 없음 |
| 네트워크 | 기존 ky / Supabase SDK | 인증·서버 저장 API 미변경; 실제 로그인 계정의 서버 장애 재현은 미검증 |
| DnD | 기존 native DnD / 후보 SortableJS | 기존 동작 유지. 단순 표시 갱신이 spine을 재정렬하던 경로 제거. OSS 전환은 아직 미완료 |
| 버튼 / tooltip | CSS / native button,title | 기본 표현은 유지; framework 미추가 |
| dropdown / toast / shortcut | 기존 custom / native 대체 후보 | 전체 OSS 전환 미완료; 이번 변경으로 완료했다고 간주하지 않음 |
| 교정 | Gemini + 기존 diff | 요청·키·교정 엔진 유지. 복원 시 원문 문단 자동 dedupe 호출만 제거 |
| 브라우저 회귀 검사 | Playwright 1.63.0 (Apache-2.0) | test:browser → Chromium 실제 편집/저장/복원/import/export |

OSS 근거: [Microsoft HTML language service](https://github.com/microsoft/vscode-html-languageservice), [Lucide license](https://lucide.dev/license), [SortableJS](https://github.com/SortableJS/Sortable), [Playwright](https://github.com/microsoft/playwright).

## 원인과 데이터 보호

- 고정 찬사 텍스트는 앱 소스에 없음. `기도먼저.epub`의 `OEBPS/Text/great.xhtml`에 존재하는 실제 원문이므로 삭제하지 않음.
- 과거 장별 index snapshot과 살아 있는 editor buffer가 복원/전환 때 섞일 수 있었음. canonical XHTML은 BookProject에 한 번만 보관하고 selection은 chapter.id로 결정.
- Tiptap의 프로그램적 로딩과 무변경 mode 전환을 실제 편집으로 직렬화하던 경로를 차단. Tiptap 로딩 실패 시 자체 contenteditable 저장 fallback은 사용하지 않음.
- 병렬/늦은 임시저장 복원은 in-flight 공유 및 revision 확인. 프로젝트가 비어 있으면 모든 editor/preview buffer를 비움.
- 저장 validation이 실패해도 진행하던 흐름을 중단하고 Dexie transaction을 기다린 후 로컬 저장 완료를 표시.
- 표지·삭제·복원은 add/delete 버튼을 반복 클릭해 본문 slot을 재사용하지 않음. 표지는 독립 ID이며 일반 장에서는 cover DOM을 제거.
- 초기 책은 표지 + 각주 페이지. 사용자가 삭제한 항목은 reload로 재생성하지 않음. 각주 추가 시에만 중앙 페이지를 필요에 따라 생성.
- 각주는 chapter.id, originalPath 기반 상대 경로와 reference/footnote ID로 왕복. imported 각주와 앱에서 생성한 각주를 구분.
- 표시 갱신 때 목차 계층대로 DOM을 자동 재배열하면 원본 spine이 바뀌었음. 명시적 계층/DnD 이동만 재정렬하고, 일반 렌더는 순서를 보존.
- imported 표지는 원본 chapter metadata 및 TOC 포함 여부를 함께 보존.
- 포맷은 유효한 XML 및 텍스트/속성/inline 공백 등 의미 동일성을 확인한 경우에만 Monaco edit으로 적용하고 canonical에도 같은 값을 반영.

## 검증과 남은 범위

실행: `npm test`, `npm run verify:epub`, `npm run test:browser`, `npm audit`.

최종 결과: 단위 테스트 13 PASS, Chromium 브라우저 테스트 8 PASS, EPUB 32개 파일 SHA-256 및 26개 spine/16개 TOC 의미 검증 PASS, audit 취약점 0. 실제 앱으로 export한 EPUB의 spine/TOC/이미지 hash/CSS/깨진 링크도 브라우저 테스트에서 확인했다.

브라우저 검사는 A/B/C 독립 저장·reload, 표지/각주 삭제, 자동수정과 validation, 각주 왕복, 설정 dialog, 실제 clipboard 붙여넣기, 빠른 장 전환, source 위치, DnD 선택 보존, 실제 EPUB import/save/reload/export를 포함한다.

미검증/제한: 실제 인증 서버 저장, Safari/Firefox, 모든 EPUB 레이아웃, EPUBCheck 실행. source 위치는 OSS AST + 앱의 ID/element 연결이며 범용 완전한 character-level source map이나 CFI가 아니다. CDN 실패 가능성이 남고, 일반편집은 Tiptap이 지원하지 않는 임의 XHTML 구조의 무손실 편집을 보장하지 않는다. dropdown/toast/일부 toolbar fallback/일부 아이콘 등의 전체 OSS 전환은 별도 단계로 남는다.

## 파일과 다음 단계

- 수정: ui.js, index.html, xhtml-tools.js, package.json, package-lock.json, node_modules/.package-lock.json, .gitignore, tests/xhtml-tools.test.mjs.
- 추가: book-project.js, xhtml-source.js, xhtml-validation.js, playwright.config.js, scripts/serve-tests.mjs, tests/book-project.test.mjs, tests/xhtml-source.test.mjs, tests/browser/*.spec.js, 이 문서.
- 삭제: 호출처가 없어진 cover-view.js 및 그 단위 테스트. 실제 cover DOM 생성/삭제 브라우저 검사로 대체했으며 Git에서 복구 가능하다. 기존 dependency 삭제는 없다.
- 다음 단계: 별도 범위에서 인증 서버의 최신 snapshot 병합/실패 복구, 다중 장 각주 편집·삭제·DnD 후 왕복, EPUB3 추가 fixture, 남은 generic UI의 OSS 전환을 진행한다. 이 단계 전체를 완료했다고 보고하지 않는다.
