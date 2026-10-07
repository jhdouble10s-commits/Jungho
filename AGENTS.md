# AGENTS.md

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