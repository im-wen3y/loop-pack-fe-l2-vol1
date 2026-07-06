# 컴포넌트 컨벤션

## Server/Client Component 경계

- Client 경계는 최대한 하위(leaf 컴포넌트)로 — 상위를 Client로 선언하면 그 아래 트리 전체가 Client Component가 됨
- Server Component를 Client Component의 children/props로 전달해 Client 경계를 최소화하는 합성(Composition) 우선 고려
- 함수형 컴포넌트만 작성, `React.FC` 금지 — Server Component는 async 함수일 수 있어 `React.FC` 시그니처와 맞지 않음

## 데이터 조회 / 변경

- Client Component의 데이터 조회 훅은 `fetch`/`axios` 등 통신 구현에 직접 의존하지 않는다 — service 함수만 호출한다 (DIP). Server Component에서 직접 `fetch`하는 경우는 이 규칙 대상 아님
- mutation은 Server Actions을 우선 고려, 클라이언트 상태만 다루는 경우에 한해 이벤트 핸들러 유지
- 비동기/부수효과는 가능하면 Server Component/Server Action으로 처리, 클라이언트에서 불가피한 경우에만 `useEffect`로 분리

## 상태와 훅

- **파생값은 계산** — `useState` + `useEffect` 동기화 금지
- `useMemo` / `useCallback`은 실측 성능 문제 시에만
- 커스텀 훅은 단일 책임
- URL에 반영되어야 하는 값(필터, 페이지, 검색어)은 Next Router(`useSearchParams`, `useRouter`) 기반 URL 상태로 관리

## 로딩 / 에러 (App Router)

- 라우트 단위 로딩/에러는 App Router 파일 컨벤션 우선 사용: `loading.tsx` / `error.tsx` / `not-found.tsx`
- 라우트보다 좁은 범위(컴포넌트 단위)의 비동기/에러 처리에는 `<Suspense>` / `<ErrorBoundary>` 직접 사용
- 중첩 범위 최소화
