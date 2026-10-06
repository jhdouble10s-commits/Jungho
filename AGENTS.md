# AGENTS.md

# Project
이 프로젝트는 브라우저 기반 EPUB 3.0 제작/편집 웹앱이다.

가장 중요한 목표는:
- EPUB import → 수정 → export 과정에서 원본 구조를 최대한 보존
- 기존 정상 기능을 깨뜨리지 않음
- 범용 기능은 검증된 OSS를 우선 사용
- EPUB 고유 도메인 로직은 필요한 경우 자체 구현 유지

---

# 1. 가장 중요한 작업 원칙

모든 수정은 반드시:

1. 기존 코드 확인
2. 영향 범위 확인
3. 최소 범위 수정
4. 테스트
5. 회귀 테스트

순서로 진행한다.

요청과 관계없는 코드를 임의로 리팩터링하지 않는다.

전체 컴포넌트/파일을 이유 없이 재작성하지 않는다.

기존 정상 기능을 "더 깔끔하게 만들기 위해" 변경하지 않는다.

---

# 2. OSS 적용 원칙

범용 기능은 검증된 OSS를 우선 사용한다.

현재 주요 OSS:

- JSZip: EPUB ZIP import/export
- DOMPurify: Preview HTML sanitize
- Monaco Editor: XHTML editor
- Emmet: XHTML abbreviation
- Tiptap: 일반편집

새 OSS 도입 시:

- 기존 기능보다 명확한 장점이 있어야 함
- 라이선스 확인
- 유지보수 상태 확인
- 현재 비-React 구조와 호환되는지 확인
- 기존 OSS와 기능이 중복되면 추가하지 않음

예:
Monaco가 존재하므로 CodeMirror를 추가하지 않는다.

---

# 3. OSS가 없어도 삭제하면 안 되는 핵심 도메인 기능

다음 기능은 EPUB 편집기의 핵심 도메인 로직이다.

적절한 OSS가 없다는 이유만으로 삭제하지 않는다.

- EPUB2 → EPUB3 변환
- container.xml → OPF 탐색
- manifest 분석
- spine 보존
- toc.ncx → nav.xhtml 변환
- 목차 계층 유지
- includeInToc 유지
- originalPath 보존
- XHTML 파일명/경로 보존
- 내부 href 보존
- footnote 연결 보존
- cover 관계 분석
- 이미지 상대경로 보존
- CSS 연결관계 보존
- import → export round-trip 보존

이러한 기능은 검증된 OSS가 있으면 일부 활용할 수 있지만
BookProject의 의미적 변환 로직은 프로젝트 자체 로직으로 유지할 수 있다.

---

# 4. Source of Truth

EPUB 프로젝트 데이터는 하나의 상태를 기준으로 관리한다.

중요 데이터:

BookProject
- metadata
- chapters
- resources
- stylesheets
- cover
- selectedChapterId

Chapter
- id
- originalPath
- title
- tocTitle
- includeInToc
- parentId
- tocLevel
- spineOrder
- xhtml

Resource
- id
- originalPath
- mediaType
- blob/file
- isCover

Monaco, Tiptap, Preview 등의 내부 상태가
별도의 원본 데이터가 되면 안 된다.

---

# 5. Chapter 데이터 보호

chapter.id는 절대 임의 변경하거나 재생성하지 않는다.

장 순서 변경 시:

변경 가능:
- spineOrder / order
- parentId
- tocLevel

변경 금지:
- id
- XHTML content
- originalPath
- 이미지
- 내부 링크

현재 editor 내용을 모든 chapter에 복사하는 코드를 절대 작성하지 않는다.

항상 selectedChapterId 또는 chapter.id 기준으로
해당 장만 업데이트한다.

---

# 6. EPUB 원본 보존

EPUB import/export 시 반드시 보존:

- metadata
- manifest
- spine
- TOC text
- TOC hierarchy
- includeInToc
- XHTML
- originalPath
- CSS
- images
- image path case
- cover
- internal href
- footnote
- resources

EPUB2를 EPUB3로 변환하면서 형식 자체가 달라지는 것은 허용하지만
사용자 관점의 콘텐츠 구조와 연결 관계는 유지한다.

---

# 7. XHTML Editor 보호

Monaco Editor를 XHTML editor로 사용한다.

다음 기능을 유지:

- line number
- syntax highlight
- cursor
- selection
- undo/redo
- Emmet
- Ctrl/Cmd+S
- chapter switching
- image insertion at cursor
- XHTML auto-fix

XHTML editor 관련 작업 시
Monaco를 새 editor로 교체하지 않는다.

---

# 8. 일반편집 보호

Tiptap을 일반편집에 사용한다.

일반편집 결과 때문에
원본 XHTML을 불필요하게 재구성하지 않는다.

가능한 한 XHTML source 보존을 우선한다.

---

# 9. Preview 보안

외부 EPUB HTML/XHTML을 Preview에 표시할 때
DOMPurify를 사용한다.

DOMPurify는 preview/render 단계에서만 적용한다.

원본 XHTML 또는 export XHTML을
sanitize 결과로 덮어쓰지 않는다.

---

# 10. ZIP

EPUB 압축/해제는 JSZip을 사용한다.

직접 ZIP header, CRC, central directory, deflate 구현을 다시 만들지 않는다.

EPUB export 시:

- mimetype 파일이 ZIP 첫 번째 항목
- mimetype은 STORED / 무압축

조건을 반드시 유지한다.

---

# 11. Storage

프로젝트 저장 구조 변경 시:

- 장별 데이터 독립성 유지
- Blob 이미지 지원
- 저장 과정에서 current chapter가 다른 chapter를 덮어쓰지 않음
- 저장 데이터와 editor state를 혼동하지 않음

IndexedDB를 OSS로 전환할 경우 Dexie.js를 우선 검토한다.

---

# 12. Drag & Drop

현재 프로젝트는 비-React 구조다.

React 라이브러리 하나를 쓰기 위해
React를 새로 도입하지 않는다.

Drag & Drop OSS 선정 시:

- Vanilla JS 지원
- nested sortable 가능
- 현재 유지보수됨
- MIT / Apache / BSD 등 명확한 라이선스

를 우선한다.

적절한 OSS가 없다면
기존 기능을 바로 삭제하지 말고 먼저 보고한다.

---

# 13. CSS 수정

요청된 컴포넌트 범위만 수정한다.

가능하면 scoped selector를 사용한다.

전역:
- body
- *
- div

등을 이유 없이 수정하지 않는다.

특히:
- height
- overflow
- position
- flex
- grid
- margin
- padding

수정은 다른 UI에 영향을 줄 수 있으므로 주의한다.

---

# 14. Dead Code

사용하지 않는 과거 구현은 확인 후 제거한다.

특히 과거 단일 chapter editor,
사용하지 않는 event handler,
중복 save handler,
중복 editor state는 남기지 않는다.

삭제 전 반드시 실제 reference가 없는지 확인한다.

---

# 15. Git 안전

금지:

- git reset --hard
- 사용자 작업 삭제
- force checkout
- 과거 파일 전체 덮어쓰기

기존 작업을 보존한다.

필요한 경우 diff를 확인한 후 선택적으로 수정한다.

---

# 16. Testing

코드 변경 후 최소 확인:

- npm test
- npm run verify:epub

관련되는 경우 추가 확인:

- EPUB import
- EPUB export
- chapter switching
- chapter별 content 독립성
- TOC
- spine
- cover
- CSS
- images
- internal links
- footnotes
- Monaco
- Tiptap
- Preview
- Save

기존 테스트를 수정해서 실패를 숨기지 않는다.

---

# 17. Round-trip

가능한 경우 실제 fixture EPUB으로:

EPUB
→ import
→ 아무 수정 없음
→ export

검증한다.

비교:

- chapter count
- spine order
- toc labels
- toc hierarchy
- image count
- image hash
- CSS
- cover
- href
- footnote destination

---

# 18. 작업 완료 보고

모든 작업 후 짧게 보고:

1. 수정한 파일
2. 수정한 기능
3. 새 OSS dependency
4. 제거한 custom/dead code
5. 기존 기능 영향 여부
6. 테스트 결과
7. 남은 리스크

AGENTS.md에 UI/UX Design Rules를 추가하고,
현재 전체 화면을 실무용 데스크톱 EPUB 편집기 관점에서 점검해줘.

기능은 변경하지 말고 UI/UX만 개선 대상으로 분석해줘.

특히 확인:
- spacing 일관성
- panel 구조
- 버튼 hierarchy
- typography
- editor 중심 레이아웃
- 책의 구성 tree density
- toolbar 정리
- 불필요한 card/border/shadow
- preview 영역
- 저장 상태 표시
- toast/dialog 디자인
- 전체 디자인 consistency

목표 스타일:
Linear / Figma / VS Code / Vercel Dashboard 계열의
깔끔하고 전문적인 productivity tool.

먼저 개선안만 정리하고,
코드는 바로 수정하지 말 것.

요청과 무관한 변경이 있었다면 반드시 명시한다.