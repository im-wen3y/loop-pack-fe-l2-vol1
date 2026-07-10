# src/app/api

4주차 mock 백엔드. 실제 DB 대신 Next.js Route Handler가 고정 데이터를 내려준다.

## 응답 형태 규칙

모든 route는 `{ <리소스명>: T[] }` 형태로 응답한다 — 예: `{ products: [...] }`, `{ sizes: [...] }`,
`{ options: [...] }`. 리소스가 하나뿐이라 배열을 최상위로 바로 내려도 되지만, 나중에 페이지네이션
메타(`nextCursor` 등)를 추가할 여지를 남기려고 항상 객체로 감싼다. 새 route를 추가할 때도 이 규칙을
따른다.

## 타입

route의 mock 배열은 반드시 타입을 붙여서(익명 리터럴로 두지 않고) 응답 구조가 실수로 깨지면
컴파일 타임에 잡히게 한다. 타입을 어디에 정의할지는 그 타입이 이미 다른 곳에 있는지에 따라 갈린다:

- 아직 어디에도 없는 타입이면 route 파일과 같은 폴더의 `_types.ts`에 정의하고 export한다
  (`.claude/rules/code-style.md`의 "동일한 도메인 값은 타입과 함께 한 곳에 정의" 규칙 적용).
  예: `src/app/api/products/_types.ts`의 `Product` — API 응답 형태가 UI prop 형태(`ThumbnailSelectOption`)와
  달라서 별도 타입 + 변환 함수(`toThumbnailOptions`, 유일한 소비처인 `SelectPreview.tsx`에 인라인됨)가 필요했다.
- 응답 아이템 형태가 이미 소비처(주로 UI 컴포넌트)의 prop 타입과 완전히 같다면, `_types.ts`를 새로
  만들어 같은 형태를 중복 정의하지 않고 그 타입을 route에서 그대로 import해서 mock 배열에 붙인다.
  예: `src/app/api/sizes/route.ts`가 `SizeOptionSelect`의 `SizeSelectOption`을, `purchase-options/route.ts`가
  `TextOptionSelect`의 `TextSelectOption`을 그대로 가져다 씀.

두 경우 다 route와 소비처가 같은 타입을 참조하게 되어, 응답 구조가 바뀌면 소비처에서 타입 에러로
바로 드러난다는 목적은 동일하다.
