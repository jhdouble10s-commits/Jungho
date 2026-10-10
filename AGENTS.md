# AGENTS.md

구조·실행법·공통 기준 변경 때만 수정한다. 현황·할 일은 넣지 않는다.

1. 범위·실행
- diff·caller·DOM id/data-* 참조·state 영향을 확인한다. 요청만 최소 수정하고 사용자 변경을 보존한다.
- 무관한 refactor/rename·전체 rewrite/formatter·global CSS·큰 `innerHTML` 재렌더를 피한다. handler 재사용, listener 중복/덮어쓰기 금지.
- commit/push·운영 배포·DB 변경·삭제는 명시적으로 승인된 범위만 수행한다. 대상·위험이 바뀌면 재확인한다. 비밀 값·브라우저 프로필을 문서·snapshot·EPUB·Git에 넣지 않는다.
- non-React HTML + ES modules. 실행법·버전은 현재 manifest·lockfile·정적 번들을 따른다. 서버: `node scripts/serve-tests.mjs`. 번들: `npm run build`. browser: `npm run test:browser`.

2. OSS·UI/UX 일관성
- 기존 컴포넌트·토큰·OSS부터 확인·재사용한다. 같은 역할은 공통 컴포넌트로 구현하고 기능별 독자 UI를 만들지 않는다.
- Lucide 아이콘·Floating UI 팝업 위치 계산·native `dialog`/`details` 공통 래퍼를 우선 사용한다. React-only 의존성·기능별 임의 OSS·OSS/custom 중복 구현을 피한다.
- `theme.css`·`theme.js`의 light/dark 색상·간격·타이포·테두리·radius·focus/disabled/loading/error를 통일하며 토큰을 우회하지 않는다.
- 짧고 일관된 motion·reduced-motion을 지원하고 키보드·focus 복원·접근성 이름·대비·반응형을 검증한다.
- 공통 primitive가 없으면 기존 스택에 맞는 OSS/컴포넌트를 제안한다. 큰 교체·refactor는 합의 후 진행한다.
- OSS는 실행 경로에 연결한다. OSS 부재로 기능을 삭제하지 않는다. EPUB 보존·state 연결·Gemini 교정 등 도메인 로직을 유지하며 제거는 먼저 제안한다.

3. 데이터·편집
- canonical state는 `BookProject`, 선택은 `selectedChapterId`다. editor/Preview에 독립 원문·선택 state를 추가하지 않는다. index는 chapter ID가 아니다.
- canonical 문서는 XHTML이다. Tiptap HTML은 UI 표현이며 무변경 mode 왕복만으로 재직렬화하지 않는다.
- 요청 외에는 `chapter.id`, `originalPath`, `xhtml`, `title`, `tocTitle`, 목차 포함/계층/순서·spine, CSS·cover·리소스 경로/대소문자·내부/각주 링크를 보존한다.
- 표지·각주·장 추가/삭제·저장은 대상에만 적용한다. 본문 재사용·첫 장 fallback 저장·모든 장 buffer 복제·목차 렌더로 spine 재정렬을 금한다.
- Blob URL·sanitize 결과를 원본에 쓰지 않는다. format/자동수정은 XHTML 유효성·내용·속성·inline 공백 의미를 보존한다. 일반편집 저장에 regex normalizer를 확대하지 않는다.
- invalid XHTML 저장을 차단하고 오류 위치를 표시한다. formatter는 기존 language service를 사용한다.
- 생성 각주만 source chapter ID 기준으로 정리·재번호화한다. imported 각주와 noteref/footnote/backlink는 보존한다.
- programmatic 갱신/사용자 편집을 구분하고 undo/redo·선택·caret/scroll을 보존한다. focus mapping 실패 시 임의 이동을 금한다.

4. 비동기·저장
- owner/project/chapter ID와 revision·model/generation을 캡처하고 완료 시 대상 유효성을 검사한다.
- A장 작업 중 B장을 선택해도 유효한 결과는 A장에만 반영한다. 선택 변경만으로 버리지 않는다. 화면 갱신은 현재 선택을 별도 검사한다.
- 계정/프로젝트 교체·대상 삭제·이후 편집과 충돌한 오래된 응답이 현재 내용을 덮어쓰지 못하게 한다.
- 명시적 저장: 최신 editor buffer → 대상 chapter → project snapshot → 서버 조건부 저장. 재열기는 서버의 최신 record를 읽는다.
- 서버 실패·충돌·원격 갱신에도 현재 탭의 미저장 내용을 보존하고, 자동 저장이나 로컬 초안 복구를 되살리지 않는다.
- 성공한 저장의 revision만 완료로 처리하고 저장 중 새 편집은 제외한다. 기존 IndexedDB 원고는 별도 동의 없이 삭제·동기화하지 않는다.
- 현재 revision의 서버 반영 전 브라우저를 떠날 때만 이탈 경고를 켠다. 편집·장 전환·focus 변경에는 경고하지 않는다.
- `beforeunload`는 새로고침·외부 이동에도 발생하며 표시가 제한될 수 있다. 닫기에만 확실히 뜬다고 약속하지 않는다.

5. 검증·보고
- 최종 수정 후 `npm test`·`npm run verify:epub`를 실행한다. 좁은 수정은 관련 browser 회귀, 저장/state 등 공통 경로는 browser 전체를 실행하며 회귀 테스트를 추가한다.
- 실제 앱에서 내보낸 결과를 `npm run verify:epub -- source.epub exported.epub`로 비교한다. ZIP round-trip만으로 앱 export 정상이라 보고하지 않는다.
- 미검증 이유를 쓰고 mock/로컬·push·배포·실서버를 구분한다. 변경 파일·요점·테스트·리스크를 짧게 보고한다. OSS 교체 시 사용 OSS·제거한 중복을 적는다.
