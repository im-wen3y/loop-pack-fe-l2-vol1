# ProductListPage — 레이어 분리 근거

> 상세 표·고민 과정은 [`docs/week-03/separation-checklist.md`](../../docs/week-03/separation-checklist.md) 참고. 이 문서는 PR에서 바로 참조할 수 있는 핵심 요약.

## 레이어 구조

```
_apis/product/       API 호출 (endpoint, DTO) — TanStack Query를 모른다
_service/product/    캐싱 전략 (queryOptions, useGetProductList) — fetch를 모른다
_hooks/productList/  화면 전용 Custom Hook (상태·조합)
_utils/               순수 함수 (포맷, 계산)
_components/productList/  UI 렌더링 전용
productList/ProductListPage.tsx  위 조각을 조립하는 얇은 페이지
```

## Custom Hook — 한 문장 설명

| Hook                            | 설명                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `useProductFilters`             | 필터·검색·정렬 상태와 의미 기반 핸들러를 소유한다                              |
| `usePagination`                 | 현재 페이지 번호와 이동만 책임진다 (`totalPages`는 갖지 않음 — 쿼리 훅이 계산) |
| `useProductListQuery`           | 필터·페이지를 서버 요청 DTO로 조립해 조회하고 화면용 형태로 반환한다           |
| `useSyncFiltersToUrl`           | 필터·페이지 상태를 URL 쿼리에 단방향으로 반영한다                              |
| `useWishlist`                   | 위시리스트 id 목록을 유지하고 토글을 노출한다                                  |
| `useRecentlyViewed`             | 최근 본 상품 id를 최신순·중복 제거·최대 10개로 유지한다                        |
| `useLocalStorageState` (제네릭) | key·초기값을 받아 localStorage에 동기화되는 상태를 돌려준다                    |
| `useScrollToTop` (제네릭)       | dependency가 바뀌면 화면을 맨 위로 스크롤한다                                  |
| `useDebouncedValue` (제네릭)    | 값이 일정 시간 더 이상 바뀌지 않을 때만 최신값을 반영한다                      |

## 분리 근거 요약

- **`_api` vs `_service`** — `_apis`는 엔드포인트 호출만 알고 TanStack Query를 모른다. `_service`는 그 위에서 캐싱 전략만 다루고 `fetch`를 직접 호출하지 않는다. 페이지는 `_service`의 훅 하나만 알면 된다 (DIP).
- **`useProductListQuery`가 파라미터 조립까지 갖는 이유** — `_service`는 캐싱만 책임지고, 파라미터 조립·`totalPages` 파생 계산은 화면 관심사라 훅을 한 겹 더 뒀다.
- **`usePagination`과 `useProductFilters`를 합치지 않은 이유** — 조건(필터)과 위치(페이지)는 책임이 다르다. `onFilterChange` 콜백으로만 연결해 페이지 소유권을 `usePagination`에 유지했다.

## 분리하지 않은 것

| 대상                                         | 이유                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `viewMode` 상태                              | 부수효과·파생 없는 순수 UI 상태 1개. 훅으로 빼면 파일만 늘고 얻는 게 없다                 |
| `loading`/`background-loading` 텍스트        | 로직 없는 1줄 텍스트라 분리해도 재사용·테스트 이득이 없다                                 |
| `useSyncFiltersToUrl` 내부 URL 파라미터 조립 | 훅이 소유한 책임 그 자체. 밖으로 빼면 훅↔util 왕복만 늘어난다                             |
| 필터를 URL 상태로 완전히 이전하지 않은 것    | 현재는 `useState` 소유 + URL 단방향 반영까지만. URL→상태 복원은 라우터 도입 시점으로 미룸 |

## 숨은 버그

| 증상                                                | 원인                                                                         | 수정                                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 새로고침·북마크 시 필터 초기화                      | 필터를 URL에 반영만 하고 초기 마운트 시 읽어오지 않음                        | 미수정 — 라우터 도입 시점으로 범위 제외 (위 표 참고)                                                                                                                                                                       |
| API 오류 후 페이지 전체 새로고침 없이는 재시도 불가 | `onRetry`가 `window.location.reload()`를 호출해 TanStack Query 캐시까지 날림 | `useProductListQuery`가 반환하는 `refetch()`로 교체 — 캐시 유지한 채 해당 쿼리만 재조회                                                                                                                                    |
| 검색어 입력마다 API 요청 발생                       | `searchQuery` 변경이 debounce 없이 즉시 쿼리 파라미터에 반영됨               | `useProductListQuery`에서 `useDebouncedValue(filters.searchQuery, 300)`로 검색 조회만 debounce. 입력창은 debounce 없는 값을 그대로 써서 타이핑 반응성은 유지 (Playwright로 확인: 타이핑 중 0건, 입력 멈춘 뒤 300ms 후 1건) |
