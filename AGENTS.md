# AGENTS.md

## Regression / Scope Safety

- 한 작업에서 요청받은 기능 외 다른 영역은 수정하지 않는다.
- 수정 전 반드시 영향받는 함수/DOM/state를 먼저 확인한다.
- 공통 함수 수정 시 호출처를 전부 검색하고 회귀 영향 확인.
- unrelated refactor/cleanup/rename 금지.
- 전체 파일 rewrite 금지.
- 전체 formatter 금지.
- global CSS(body, *, div 등) 수정 금지.
- DOM id/data-* selector 변경 전 reference search 필수.
- innerHTML로 큰 영역 전체 재렌더 금지. 필요한 노드만 업데이트.
- 기존 event listener를 덮어쓰거나 중복 등록하지 않는다.
- selectedChapterId 이외의 새로운 selection state를 만들지 않는다.
- index 기반 chapter identity 사용 금지.
- async callback은 target chapter.id를 캡처하고 stale 결과는 버린다.
- 기능 수정 후 반드시 관련 기존 기능 smoke test를 함께 실행한다.

## 1. OSS First

기능을 수정하거나 추가하기 전에 적절한 유지보수 중인 오픈소스가 있는지 먼저 확인한다.

- 적절한 OSS가 있으면 OSS를 사용
- 동일 기능의 custom 구현과 중복 사용 금지
- OSS와 custom이 충돌하면 OSS 기준으로 통일
- 적절한 OSS가 없으면 해당 기능 삭제/비활성화
- Gemini API 맞춤법 교정은 예외
- React 전용 OSS는 non-React 프로젝트에 도입하지 않음
- 설치 여부가 아니라 실제 실행 경로에서 OSS가 사용되는지 확인

## 2. State

BookProject가 유일한 canonical state.

chapter 선택은 반드시:

BookProject.selectedChapterId

기준으로 처리.

Monaco, Tiptap, Preview가 별도의 chapter selection state를 가지면 안 된다.

index를 chapter identity로 사용하지 않는다.

## 3. XHTML

최종 canonical document는 XHTML.

Tiptap HTML은 UI용 임시 표현.

일반편집 때문에 XHTML 구조가 불필요하게 변경되지 않게 한다.

## 4. Data Safety

기존 chapter의 다음 값은 기능 수정 때문에 임의 변경하지 않는다:

- id
- originalPath
- xhtml
- title
- tocTitle

특히 cover/add/delete/save 작업에서 본문 chapter 데이터 손실 금지.

## 5. Minimal Change

- 대규모 rewrite 금지
- unrelated refactor 금지
- 전체 formatter 금지
- 현재 작업에 필요한 범위만 수정
- 기존 기능을 수정하기 전에 reference/영향 범위 확인

## 6. Async Safety

비동기 작업은 target chapter/project identity를 capture하고,
완료 시 현재 state와 일치할 때만 적용한다.

stale callback이 다른 chapter를 덮어쓰면 안 된다.

## 7. Tests

수정 후 반드시:

npm test
npm run verify:epub

관련 기능은 regression test 추가.

테스트하지 않은 것은 정상이라고 보고하지 않는다.

## 8. Completion Report

완료 후 짧게:

- 수정 파일
- 사용한 OSS
- 제거한 custom 구현
- 테스트 결과
- 남은 리스크

