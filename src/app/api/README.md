# src/app/api

4주차 mock 백엔드. 실제 DB 대신 Next.js Route Handler가 고정 데이터를 내려준다.

## 응답 형태 규칙

모든 route는 `{ <리소스명>: T[] }` 형태로 응답한다 — 예: `{ products: [...] }`, `{ sizes: [...] }`,
`{ options: [...] }`. 리소스가 하나뿐이라 배열을 최상위로 바로 내려도 되지만, 나중에 페이지네이션
메타(`nextCursor` 등)를 추가할 여지를 남기려고 항상 객체로 감싼다. 새 route를 추가할 때도 이 규칙을
따른다.

## 타입

각 route의 응답 아이템 타입은 route 파일과 같은 폴더의 `_types.ts`에 정의하고 export한다
(`.claude/rules/code-style.md`의 "동일한 도메인 값은 타입과 함께 한 곳에 정의" 규칙 적용). route와
그 타입을 쓰는 다른 곳(현재는 `src/services/catalog.ts`)이 같은 타입을 참조해서, route의 응답
구조가 바뀌면 소비처에서 타입 에러로 바로 드러난다. 예: `src/app/api/products/_types.ts`.
