# RFC — 6주차 FSD 전환

- 작성일: 2026-07-28
- 브랜치: `feat/week-06`
- 상태: 진행 중 (0~2단계 완료 · 3단계 `entities`부터 남음)

> 채움 규칙: **사실**(측정값·현재 코드에서 읽어낸 것)은 지금 채웠고, **결정**(목표 구조·슬라이스 배치·Public API)은 비워 뒀다. `_(미정)_` 표시가 있는 칸이 구조 변경과 함께 결정할 자리다.

---

## 0. 동작 기준선

### 검증 전략

기준선은 **자동(E2E) + 수동** 두 층으로 나눈다.

- `e2e/week-05-state.spec.ts`가 검색·카테고리·정렬·페이지네이션·뒤로/앞으로·목록 에러/빈 상태·persist 복구를 이미 검증한다. 마이그레이션 **단계마다** 이 스펙을 돌려 회귀를 잡는다.
- E2E가 보지 않는 범위(홈의 로딩·에러·빈 상태, 조건 전환 중 이전 목록 유지, 새 탭 URL 공유)만 수동으로 확인한다. 수동 확인은 **구조 변경 전 1회, 구조 변경 후 1회**만 한다.
- 판정은 "비슷해 보인다"가 아니라 **관찰값 문자열 일치**로 한다.

| 시점                  | 실행                                             | 산출물               |
| --------------------- | ------------------------------------------------ | -------------------- |
| 구조 변경 전 (기준선) | `pnpm check`, `pnpm test:e2e`, 수동 M1~M9        | 아래 표의 Before 열  |
| 구조 변경 중 (단계별) | `pnpm test:e2e`                                  | 마이그레이션 단계 표 |
| 구조 변경 후 (최종)   | `pnpm check`, `pnpm test:e2e`, 수동 M1~M9 재확인 | 아래 표의 After 열   |

### 자동 검증 결과

최초 측정: 2026-07-28, `feat/week-06` (구조 변경 전)

재확인: 2026-07-29, HEAD `20bc25d` + 현재 작업 트리. `src` 폴더 구조와 애플리케이션 코드는 변경 전 상태이며, 문서·ESLint 설정 변경만 포함한다.

| 명령               | 구조 변경 전 | 구조 변경 후 | 판정 |
| ------------------ | ------------ | ------------ | ---- |
| `pnpm check`       | 통과         |              |      |
| ├ `pnpm test`      | 36/36 통과   |              |      |
| ├ `pnpm lint`      | 통과         |              |      |
| ├ `pnpm typecheck` | 통과         |              |      |
| └ `pnpm build`     | 통과         |              |      |
| `pnpm test:e2e`    | 40/40 통과   |              |      |

#### 기준선 상세 (구조 변경 후 같은 값이 나와야 하는 것)

- `pnpm test` — Test Files 3/3, Tests 36/36. API 입력 검증과 fixture 계약을 보호한다.
- `pnpm build` — 라우트 6개. 동적 `/`·`/api/home`·`/api/products`, 정적 `/products`·`/hydration-demo`·`/_not-found`. **라우트 구성과 동적/정적 구분이 구조 변경 후에도 같아야 한다.**
  - 예외: 1단계에서 `hydration-demo`를 삭제하기로 결정했으므로 구조 변경 후 기대값은 **라우트 5개**다. 이건 이동 때문에 라우트가 사라진 회귀가 아니라 명시적 삭제 결정의 결과이고, 나머지 5개의 구성과 동적/정적 구분은 그대로여야 한다.
- `pnpm test:e2e` — 재확인 실행에서 Chromium·WebKit 40/40 통과. 최초 측정에서 실패했던 아래 WebKit 테스트도 이번 전체 실행과 단독 3회 반복에서 모두 통과했다.

#### 최초 측정에서 관찰된 E2E 플레이키 1건

- 대상: `[webkit] 5주차 예외와 복구 › debounce 대기 중 페이지를 떠나면 검색어 변경을 취소한다` ([week-05-state.spec.ts:287](../../e2e/week-05-state.spec.ts#L287))
- 증상: `expect(page).toHaveURL('/')`가 5초 안에 만족되지 않음. 관찰된 URL이 `/products` → `/products?q=%EC%8A%A4%ED%83%A0%EB%A6%AC`로, **debounce가 이탈 후에도 반영된** 모습.
- 판정: **플레이키**. 같은 테스트를 WebKit 단독 `--repeat-each=3`으로 재실행하면 3/3 통과한다. 4 worker 병렬 실행의 부하에서 300ms debounce와 페이지 이탈 타이밍이 겹칠 때만 발생.
- 재확인 결과: 2026-07-29 전체 E2E에서 통과했고, WebKit 단독 `--repeat-each=3`에서도 3/3 통과했다.
- 기준선 처리: 구조 변경 후 전체 40/40과 단독 3/3을 기대한다. 이 테스트가 다시 실패하면 기존 플레이키 이력과 함께 실패 빈도를 비교하고, 다른 테스트가 하나라도 새로 실패하면 회귀로 판정한다.
- 남은 위험: 구조 변경으로 debounce·이탈 처리 위치가 바뀌면 이 플레이키가 상시 실패로 바뀔 수 있다. 구조 변경 후 이 테스트만 단독 재실행해 여전히 3/3인지 함께 확인한다.

> 최초 측정은 이 플레이키 때문에 exit 1이었고, 재확인은 exit 0이었다. 구조 변경 후에는 exit code뿐 아니라 통과 개수와 실패 테스트 이름도 함께 비교한다.

### 수동 검증 결과

기대 동작과 관찰값(화면 문구·`총 N개`·URL 쿼리스트링·헤더 숫자)이 문자열까지 일치하면 체크한다. 어긋나면 체크하지 않고 실제 관찰값을 판정 열에 적는다.

| #   | 시나리오                 | 조작                                                                   | 기대 동작                                                         | 구조 변경 전 | 구조 변경 후 | 판정 |
| --- | ------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------ | ------------ | ---- |
| M1  | 홈 로딩                  | Network Slow 3G + `/` 하드 리로드                                      | `홈을 불러오는 중…` 노출 후 본문 교체                             | `[x]`        | `[ ]`        |      |
| M2  | 홈 에러                  | `service/home/api.ts` fetch에 `?scenario=error` 임시 추가              | `문제가 발생했어요` + `다시 시도`                                 | `[x]`        | `[ ]`        |      |
| M3  | 홈 빈 상태               | 같은 자리에 `?scenario=empty` 임시 추가                                | 배너·카테고리 유지, 인기/신상품 섹션 미노출                       | `[x]`        | `[ ]`        |      |
| M4  | 홈 정상                  | `/`                                                                    | 배너 `매일 새롭게 발견하는 취향`, 카테고리 5개, 인기·신상품 6개씩 | `[x]`        | `[ ]`        |      |
| M5  | 목록 로딩·정상           | `/products` 첫 진입                                                    | 스켈레톤 → `총 30개`, `1 / 3`                                     | `[x]`        | `[ ]`        |      |
| M6  | 조건 전환 중 목록 유지   | 목록에서 카테고리 변경                                                 | 이전 목록 유지한 채 흐려짐(`aria-busy`) → 새 결과 교체            | `[x]`        | `[ ]`        |      |
| M7  | URL 공유                 | `/products?q=스탠리&category=home&sort=price-desc` 를 새 탭에 붙여넣기 | `총 4개` + 검색·카테고리·정렬 값 복원                             | `[x]`        | `[ ]`        |      |
| M8  | 페이지 이동 중 상태 유지 | 홈에서 찜·담기 → 목록 이동 → 홈 복귀                                   | 헤더 숫자 유지, 같은 상품 `aria-pressed=true`                     | `[x]`        | `[ ]`        |      |
| M9  | 목록 에러와 복구         | `/products?page=0` → `다시 시도` → 주소를 `page=1`로                   | 에러 UI 노출, 재시도해도 실패, 조건 수정 시 복구                  | `[x]`        | `[ ]`        |      |

> M2·M3은 홈 데이터가 서버에서 prefetch되어 브라우저 DevTools로 재현할 수 없다. `scenario`를 코드에 임시로 넣어 확인한 뒤 반드시 원복하고, 그 변경은 커밋하지 않는다.

### E2E가 커버한 범위

수동 표와 중복 확인하지 않기 위해 근거를 남긴다.

| 0단계 요구 항목                      | 커버 방식      | 근거                                                                                                        |
| ------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------- |
| 검색·카테고리·정렬·페이지네이션      | E2E            | `검색·카테고리·정렬 변경은 URL과 목록을 갱신하고 page를 1로 되돌린다`, `페이지네이션 경계와 뒤로·앞으로…`   |
| URL 공유·새로고침·뒤로/앞으로        | E2E + 수동 M7  | `debounce가 끝난 검색어는 뒤로·앞으로 이동에서…` (E2E는 `goto`로 진입, 새 탭 붙여넣기는 M7)                 |
| 장바구니·위시리스트 동기화·헤더 개수 | E2E + 수동 M8  | `홈의 찜·담기 상태가 목록과 새로고침 후에도 유지된다`, `손상된 persist 저장값은…`                           |
| 상품 목록의 에러·빈 상태             | E2E            | `상품 API가 반복 실패하면 오류를 표시하고 다시 시도해 복구한다`, `검색 결과가 0건이면…`, `마지막 페이지를…` |
| 상품 목록의 로딩(조건 전환 중 유지)  | E2E + 수동 M6  | `조건 변경 중에는 이전 목록을 유지하고 새 응답 후 교체한다`                                                 |
| 홈의 정상 렌더                       | E2E(부분) + M4 | `홈 데이터는 hydration 후 브라우저에서 중복 요청하지 않는다` — 배너 제목만 확인, 섹션 구성은 미검증         |
| 홈의 로딩·에러·빈 상태               | **수동만**     | E2E에 해당 케이스 없음 → M1·M2·M3                                                                           |

### 리팩토링 중 발견한 기존 버그

구조 변경 커밋과 분리해서 기록한다. 없으면 "해당 없음".

| 재현 방법                                                                             | 원인                                                                                                        | 수정 위치                                                                        | 검증 결과             |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------- |
| M2 상태(`?scenario=error`)에서 홈 에러 화면의 `다시 시도` 클릭 → 화면이 그대로 유지됨 | `reset()`이 react-query의 `errorResetBoundary`를 초기화하지 않아 `retryOnMount: false` → 재요청이 안 일어남 | `_app/ui/RootErrorFallback.tsx` _(1단계 이동 후 경로. 수정은 구조 변경 완료 후)_ | _(구조 변경 후 확인)_ |

#### 홈 에러 재시도 버그 상세

- **발견 경위**: M2 수동 검증 중. 기대 동작(`문제가 발생했어요` + `다시 시도` 노출)은 충족했으나, 버튼이 동작하지 않았다.
- **처음 세운 가설**: `scenario=error`가 코드에 박혀 있으니 재시도해도 다시 실패하는 게 당연하다. → 두 경우(재시도 후 재실패 / 재시도 자체가 없음)는 화면상 구분되지 않아 확인이 필요했다.
- **실제 원인** _(AI(Claude)가 설치된 `@tanstack/react-query` 소스와 프로젝트 코드를 대조해 분석)_: `useSuspenseQuery`가 error 상태일 때 react-query가 재요청을 막는다. `node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js`:

  ```js
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false
    }
  }
  // getHasError: result.isError && !errorResetBoundary.isReset() → 캐시된 에러를 즉시 재throw
  ```

  `다시 시도`가 호출하는 것은 App Router `error.tsx`의 `reset()`인데, 이는 세그먼트를 리렌더할 뿐 `errorResetBoundary`를 초기화하지 않는다. `HomeContent`가 다시 마운트돼도 요청 없이 캐시된 에러를 다시 던져 같은 화면이 유지된다. `grep -rn "ErrorResetBoundary" src/` 결과 이 리셋을 호출하는 코드가 프로젝트에 없다.

- **원인 확정 방법**: 에러 화면에서 Network 탭을 열고 `다시 시도` 클릭 → `/api/home` 요청 0건이면 확정.
- **예상 수정 내용**: `app/error.tsx`에서 두 reset을 함께 호출한다. `useQueryErrorResetBoundary`는 Provider 없이도 모듈 기본 컨텍스트를 돌려주고, 그 값이 `useSuspenseQuery`가 읽는 것과 같은 인스턴스라 별도 배선이 필요 없다.

  ```tsx
  const { reset: resetQueryError } = useQueryErrorResetBoundary()
  // ...
  onClick={() => {
    resetQueryError()
    reset()
  }}
  ```

- **이번 주에 고치지 않는 이유**: 방금 확정한 M2 기준선을 바꾸는 변경이고, FSD 이동 diff에 섞이면 회귀 판정이 흐려진다. `이번 주에 하지 않을 것` 표의 기준과 같다. 구조 변경 완료 후 별도 `fix:` 커밋으로 처리한다.
- **M2 판정에 반영하지 않은 이유**: M2의 기대 동작은 에러 UI 노출까지다. 재시도 동작은 기대 동작에 없던 항목이라 검증 실패가 아니라 검증 과정에서 새로 발견한 별개 결함으로 본다.

---

## R — Requirements

### 기능 요구사항 (5주차까지)

현재 코드에서 실제로 동작하는 것만 적는다.

| 영역          | 요구사항                                                                   | 현재 구현 위치                                                      |
| ------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 홈            | 배너·카테고리·인기 상품·신상품(각 6개) 렌더                                | `app/(home)/_components/HomeContent.tsx`                            |
| 홈            | 서버 prefetch 결과를 hydrate해 브라우저 재요청 없이 렌더                   | `app/(home)/page.tsx`, `service/queryClient.ts`                     |
| 상품 목록     | 검색(300ms debounce)·카테고리·정렬(4종)·페이지네이션(12개 단위)            | `app/products/_components/*`, `service/products/*`                  |
| 상품 목록     | 조건 변경 시 `page`를 1로 되돌림                                           | `useProductFilters.ts`                                              |
| 상품 목록     | 조건 전환 중 이전 목록 유지(`keepPreviousData`)                            | `service/products/queries.ts`                                       |
| 상품 목록     | 마지막 페이지 초과 시 빈 상태 + 앞 페이지 복귀 수단 유지                   | `ProductListResults.tsx`                                            |
| URL 상태      | 검색·카테고리·정렬·페이지를 URL에 반영, 공유·새로고침·뒤로/앞으로에서 복원 | `service/products/searchParams.ts` (nuqs)                           |
| 장바구니·위시 | 상품별 담기/빼기 토글, 헤더 개수 표시, localStorage 영속·손상값 복구       | `store/*`, `components/ui/header/Header.tsx`                        |
| 공통          | 홈은 라우트 경계(`loading.tsx`/`error.tsx`), 목록은 인라인 로딩·에러 UI    | `app/(home)/loading.tsx`, `app/error.tsx`, `ProductListResults.tsx` |
| Mock API      | `/api/home`·`/api/products` Route Handler, 입력 검증과 `scenario` 제어값   | `app/api/**`                                                        |

### 비기능 요구사항

- 상위→하위 단방향 의존만 허용하고, 위반을 리뷰 없이도 판별할 수 있어야 한다.
- 하나의 기능을 지우거나 고칠 때 손댈 파일을 **grep 없이** 예측할 수 있어야 한다(5단계 삭제 시나리오의 판정 기준).
- 서버·URL·클라이언트·로컬 상태의 Source of Truth가 폴더 이동으로 바뀌지 않아야 한다.
- Client 경계는 지금처럼 최대한 리프에 둔다(`ProductCardActions`, `Header`, `ProductListContent`).
- TypeScript strict, `any`·non-null assertion·배럴 파일 금지 등 기존 컨벤션을 유지한다.
- 정적 검사(`pnpm check`)와 E2E가 구조 변경 전후로 같은 결과를 내야 한다.

### 이번에 반드시 보존할 동작

0단계 기준선의 자동·수동 검증 항목 전부. 그중 폴더 이동으로 깨지기 쉬운 것을 따로 꼽으면:

- 홈의 서버 prefetch → hydrate 경로. 서버·클라이언트가 **같은 `queryOptions`를 공유**해야 성립하므로, 옮기면서 둘로 갈라지면 즉시 깨진다.
- `getApiBaseUrl`의 서버/클라이언트 분기. 서버 실행 코드와 클라이언트 훅이 다른 레이어로 갈릴 때 잘못 섞이면 SSR이 깨진다.
- nuqs parser의 단일 정의(`productListParsers`). 파서와 화면 옵션 목록(`SORT_OPTIONS`)이 갈라지면 조건이 어긋난다.
- zustand persist store의 **저장 키**(`cart`·`wishlist`). 파일을 옮겨도 키가 바뀌면 사용자의 기존 localStorage 값이 유실된다.
- Client 경계 위치. 상위 컴포넌트에 `'use client'`가 올라가면 트리 전체가 Client가 되어 SSR 동작이 달라진다.

### 이번 주에 하지 않을 것과 그 이유

_(AI 초안 — 검토 후 본인 결정으로 확정할 것)_

| 하지 않을 것                                             | 이유                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기능 추가·UI 변경                                        | 이번 주는 리팩토링이다. 기능이 섞이면 "동작 보존"을 검증할 기준선이 무의미해진다.                                                                                                                                                                                                                                                                       |
| 상품 목록의 서버 prefetch 적용                           | URL 조건마다 결과가 달라 이득을 따져야 하는 별개 주제다(5주차에도 보류).                                                                                                                                                                                                                                                                                |
| ~~미사용 자산(`components/ui/select`·`dialog` 등) 삭제~~ | ~~삭제는 구조 이동과 다른 종류의 변경이다. 이번엔 **배치만** 정하고 삭제 여부는 근거와 함께 따로 남긴다.~~ → **2단계에서 삭제로 결정을 바꿨다.** 배치를 정하려면 재사용 범위를 봐야 하는데 소비처가 0이라 근거가 없었다. 이동과 성격이 다르다는 판단은 유지해서 별도 `chore` 커밋으로 분리했다. 판단 흐름은 [decisions.md](../week-06/decisions.md) 4번 |
| Advanced A(의존성 하네스)·B(변경 반경 실험)              | 기본 과제 완료 후 여유가 있을 때만 착수한다. _(선택 여부 미정)_                                                                                                                                                                                                                                                                                         |
| E2E 플레이키 1건 수정                                    | 구조 변경과 무관한 타이밍 이슈다. 같은 커밋에 섞으면 회귀 판정이 흐려진다.                                                                                                                                                                                                                                                                              |
| 캐시 정책(staleTime) 변경                                | 폴더 위치와 무관하다. 옮기기만 하고 값은 그대로 둔다.                                                                                                                                                                                                                                                                                                   |

---

## A — Architecture

### 현재 구조에서 실제로 겪는 문제

_(AI가 현재 코드에서 관찰한 후보 — 근거는 사실이지만, 무엇을 "문제"로 볼지는 검토 후 본인 판단으로 확정할 것)_

1. **한 기능의 코드가 세 폴더로 흩어진다.** 위시리스트 하나가 `store/wishlistStore.ts`(상태) + `store/createCollectionStore.ts`(구현) + `components/ui/productCard/ProductCardActions.tsx`(행위 UI) + `components/ui/header/Header.tsx`(개수 표시)에 걸쳐 있다. "위시리스트를 지운다"는 질문에 grep 없이 답할 수 없다.
2. **폴더 이름이 파일 종류만 말하고 역할을 말하지 않는다.** `components / hooks / utils / types / store`는 전부 "무엇인가"만 알려주고 "누구 것인가"는 알려주지 않는다. 새 파일을 만들 때마다 종류로 분류되어, 도메인이 같은 파일이 서로 멀어진다.
3. **공용 UI에 비즈니스 행위가 들어가 있다.** `components/ui/productCard/ProductCard.tsx`가 `ProductCardActions`를 직접 import하고, 그 안에서 `useCartStore`·`useWishlistStore`를 구독한다. 즉 "상품 표현"이 "장바구니·위시리스트 도메인"에 묶여 있어, 행위 없는 곳에서 카드만 재사용할 수 없다.
4. **`types/commerce.ts`가 여러 도메인의 타입 창고다.** `Product`·`Category`·`ProductSort`·`HomeResponse`·`ProductListResponse`·`MockApiScenario`가 한 파일에 있고, 서버 라우트(`app/api/**`)와 클라이언트(`service/**`)가 **같은 파일**을 함께 본다. 소유자가 불분명하고, 한 도메인 타입만 바꿔도 무관한 소비처가 함께 딸려온다.
5. **라우트에서 쓰이지 않는 자산이 공용 폴더에 섞여 있다.** `components/ui/select/*` 3종, `components/ui/dialog`, `hooks/useSelect`, `types/product-options.ts`, `utils/formatPrice.ts`, `utils/isSoldOut.ts`는 현재 어느 라우트에서도 import되지 않는다(select 3종끼리만 서로 참조). 공용 폴더에 있다는 이유로 "공용"처럼 보이지만 실제 소비처는 0이다.
6. **기존 유틸이 있는데 재사용되지 않는다.** `utils/formatPrice.ts`가 있는데도 `ProductCard.tsx:31`은 `product.price.toLocaleString('ko-KR')`를 인라인으로 쓴다. 종류별 폴더에 있으면 "이미 있는지" 확인하는 비용이 커진다는 증상.

> 3·6번은 폴더를 옮기는 것만으로는 해결되지 않는다. 3번은 `ProductCard`가 action 영역을 props로 받도록 바꾸는 **코드 변경**이 필요하고, 6번은 호출부 교체가 필요하다. 이번 주에 어디까지 할지는 마이그레이션 단계 표에서 정한다.

### Before 폴더 트리

현재 상태 (`src/` 기준, `.module.css`·정적 자산 생략)

```
src/
├── app/                                  # Next.js 라우팅
│   ├── (home)/
│   │   ├── _components/HomeContent.tsx   # 'use client', useSuspenseHomeQuery
│   │   ├── loading.tsx
│   │   └── page.tsx                      # Server, prefetch + HydrationBoundary
│   ├── products/
│   │   ├── _components/
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductListContent.tsx    # 'use client', useQueryStates + useProductListQuery
│   │   │   ├── ProductListResults.tsx    # 로딩·에러·빈 상태 분기
│   │   │   ├── usePagination.ts
│   │   │   └── useProductFilters.ts
│   │   └── page.tsx                      # Server shell + Suspense
│   ├── api/                              # mock 백엔드 (Route Handler)
│   │   ├── _data/commerce.ts             # fixture + waitForMockApi
│   │   ├── home/route.ts
│   │   └── products/route.ts
│   ├── hydration-demo/page.tsx           # 5주차 hydration 실험용 라우트
│   ├── error.tsx                         # 루트 에러 경계
│   ├── layout.tsx
│   └── providers.tsx                     # 'use client', QueryClient + NuqsAdapter
├── components/ui/                        # 공용 UI (종류별)
│   ├── banner/HeroBanner.tsx
│   ├── categorySection/CategorySection.tsx
│   ├── dialog/index.tsx                  # ← 라우트 사용처 없음
│   ├── header/Header.tsx                 # store 2개 구독
│   ├── pageContainer/PageContainer.tsx
│   ├── pagination/Pagination.tsx
│   ├── productCard/
│   │   ├── ProductCard.tsx               # ProductCardActions를 직접 import
│   │   └── ProductCardActions.tsx        # 'use client', store 2개 구독
│   ├── productGrid/
│   │   ├── ProductGrid.tsx
│   │   └── ProductGridSkeleton.tsx
│   └── select/                           # ← 라우트 사용처 없음 (3종)
│       ├── SelectToggleIcon.tsx
│       ├── SizeOptionSelect.tsx
│       ├── TextOptionSelect.tsx
│       └── ThumbnailOptionSelect.tsx
├── service/                              # 클라이언트 데이터 조회 계층
│   ├── home/{api,model,queries,service}.ts
│   ├── products/{api,model,queries,searchParams,service}.ts
│   └── queryClient.ts                    # 서버 prefetch용 QueryClient
├── store/                                # zustand
│   ├── cartStore.ts
│   ├── createCollectionStore.ts          # 공통 팩토리
│   └── wishlistStore.ts
├── hooks/
│   ├── useDebouncedCallback.ts
│   └── useSelect.ts                      # ← select 전용
├── types/
│   ├── commerce.ts                       # 여러 도메인 타입 통짜 파일
│   └── product-options.ts                # ← select 전용
├── utils/
│   ├── formatPrice.ts                    # ← 사용처 없음
│   ├── getApiBaseUrl.ts
│   └── isSoldOut.ts                      # ← select 전용
├── examples/week-05-layout/              # 제공 레이아웃 예시 (CSS만 라우트에서 import)
└── fonts/
```

### After 폴더 트리

_(미정 — 구조 변경과 함께 확정)_

```

```

### 사용할 레이어와 선택 근거

| 레이어     | 사용 여부 | 근거 |
| ---------- | --------- | ---- |
| `_app`     |           |      |
| `_pages`   |           |      |
| `widgets`  |           |      |
| `features` |           |      |
| `entities` |           |      |
| `shared`   |           |      |

### 허용 / 금지 import 예시

```ts
// 허용

// 금지
```

### 파일 매핑표

1단계에서 이동을 마친 것만 채운다. 나머지는 해당 레이어 단계에서 추가한다.

| 현재 위치                                                                                                                  | 목표 위치                                                      | 레이어 / 슬라이스 / 세그먼트          | 이동 또는 유지하는 이유                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `app/providers.tsx`                                                                                                        | `_app/providers/Providers.tsx`                                 | `_app` / — / `providers`              | QueryClient·NuqsAdapter 배선은 특정 화면이 아니라 앱 전체의 초기화다                                             |
| `app/globals.css`                                                                                                          | `_app/styles/globals.css`                                      | `_app` / — / `styles`                 | 전역 스타일도 앱 배선. 배럴을 통과할 수 없어 직접 경로로 import한다                                              |
| `app/error.tsx`(구현)                                                                                                      | `_app/ui/RootErrorFallback.tsx`                                | `_app` / — / `ui`                     | 루트 에러 화면은 특정 페이지가 아니라 앱 전체의 fallback이다                                                     |
| `app/page.module.css`                                                                                                      | `_app/ui/RootErrorFallback.module.css`                         | `_app` / — / `ui`                     | 유일 소비자가 error fallback이라 이름을 소비자에 맞췄다                                                          |
| `app/(home)/page.tsx`(본문)                                                                                                | `_pages/home/ui/HomePage.tsx`                                  | `_pages` / `home` / `ui`              | prefetch + HydrationBoundary 조립은 화면 구현이다. `dynamic` 세그먼트 설정만 라우팅 파일에 남겼다                |
| `app/(home)/loading.tsx`(구현)                                                                                             | `_pages/home/ui/HomeLoading.tsx`                               | `_pages` / `home` / `ui`              | 홈 전용 로딩 UI                                                                                                  |
| `app/(home)/_components/HomeContent.tsx`                                                                                   | `_pages/home/ui/HomeContent.tsx`                               | `_pages` / `home` / `ui`              | 홈 화면 본문                                                                                                     |
| `app/products/page.tsx`(본문)                                                                                              | `_pages/product-list/ui/ProductListPage.tsx`                   | `_pages` / `product-list` / `ui`      | Suspense 경계와 fallback 조립은 화면 구현이다                                                                    |
| `app/products/_components/ProductFilters.tsx`(+css)                                                                        | `_pages/product-list/ui/`                                      | `_pages` / `product-list` / `ui`      | 목록 화면 전용 필터 UI                                                                                           |
| `app/products/_components/ProductListContent.tsx`                                                                          | `_pages/product-list/ui/`                                      | `_pages` / `product-list` / `ui`      | 목록 화면 본문                                                                                                   |
| `app/products/_components/ProductListResults.tsx`                                                                          | `_pages/product-list/ui/`                                      | `_pages` / `product-list` / `ui`      | 목록의 로딩·에러·빈 상태 분기                                                                                    |
| `app/products/_components/usePagination.ts`                                                                                | `_pages/product-list/ui/` **(임시)**                           | `_pages` / `product-list` / `ui`      | 최종 세그먼트는 6단계 결정. `model`에 두면 "feature인가 페이지 로직인가"를 미리 확정하게 되어 현 배치를 유지했다 |
| `app/products/_components/useProductFilters.ts`                                                                            | `_pages/product-list/ui/` **(임시)**                           | `_pages` / `product-list` / `ui`      | 위와 같음                                                                                                        |
| `app/hydration-demo/page.tsx`                                                                                              | 삭제                                                           | —                                     | 5주차 실험용 라우트. 결론이 문서와 주석에 남아 역할을 다했다                                                     |
| `service/queryClient.ts`                                                                                                   | `shared/api/query-client.ts`                                   | `shared` / — / `api`                  | 소비처가 `_pages/home`이라 `_app`에 둘 수 없다                                                                   |
| `utils/getApiBaseUrl.ts`                                                                                                   | `shared/api/get-api-base-url.ts`                               | `shared` / — / `api`                  | 서버·클라이언트 origin 분기. 도메인 지식 없음                                                                    |
| `store/createCollectionStore.ts`                                                                                           | `shared/lib/create-collection-store.ts`                        | `shared` / — / `lib`                  | cart·wishlist 두 entity의 공통 구현이라 어느 한쪽에 둘 수 없다                                                   |
| `utils/formatPrice.ts`                                                                                                     | `shared/lib/format-price.ts`                                   | `shared` / — / `lib`                  | 통화·등급 정책이 없는 순수 표시 포맷. 이동과 함께 `ProductCard`의 인라인 포맷을 교체했다                         |
| `hooks/useDebouncedCallback.ts`                                                                                            | `shared/lib/use-debounced-callback.ts`                         | `shared` / — / `lib`                  | 도메인 비종속 타이밍 유틸                                                                                        |
| `components/ui/pageContainer/*`                                                                                            | `shared/ui/PageContainer/*`                                    | `shared` / — / `ui`                   | 레이아웃 셸. props가 children뿐                                                                                  |
| `components/ui/pagination/*`                                                                                               | `shared/ui/Pagination/*`                                       | `shared` / — / `ui`                   | 표시와 경계 계산만 하고 이동은 `onPageChange`로 위임                                                             |
| `components/ui/select/*`, `components/ui/dialog/*`, `hooks/useSelect.ts`, `types/product-options.ts`, `utils/isSoldOut.ts` | 삭제                                                           | —                                     | 서로만 참조하는 닫힌 섬. 라우트에서 도달 불가                                                                    |
| `types/commerce.ts`의 `CategoryId`·`Category`                                                                              | `entities/product/model/category.ts`                           | `entities` / `product` / `model`      | 카테고리는 상품 분류값이라 별도 슬라이스로 나누지 않았다                                                         |
| `types/commerce.ts`의 `Product`·`ProductSort`                                                                              | `entities/product/model/product.ts`                            | `entities` / `product` / `model`      | 상품 도메인 타입                                                                                                 |
| `types/commerce.ts`의 `HomeResponse`                                                                                       | `service/home/model.ts`(6단계에 `_pages/home/api`)             | 조회하는 쪽                           | 응답 봉투는 도메인이 아니라 화면의 조회 계약                                                                     |
| `types/commerce.ts`의 `ProductListResponse`·`ProductListQuery`                                                             | `service/products/model.ts`(6단계에 `_pages/product-list/api`) | 조회하는 쪽                           | 위와 같음                                                                                                        |
| `types/commerce.ts`의 `MockApiScenario`·`ApiErrorResponse`                                                                 | `src/app/api/_types.ts`                                        | 전환 범위 밖                          | mock 백엔드의 내부 계약                                                                                          |
| `components/ui/productCard/ProductCard.tsx`(+css)                                                                          | `features/product-card/ui/ProductCard.tsx`(+css)               | `features` / `product-card` / `ui`    | 카드를 쓰는 두 곳이 모두 찜·담기를 함께 그려서, 표시와 행위를 한 슬라이스가 소유한다                             |
| `components/ui/productCard/ProductCardActions.tsx`                                                                         | `features/product-card/ui/ProductCardActions.tsx`              | `features` / `product-card` / `ui`    | 행위 UI. store 구독은 `model/useProductCardActions.ts`로 뺐다                                                    |
| `ProductCard.tsx`의 `ProductCardItem`                                                                                      | `features/product-card/model/types.ts`                         | `features` / `product-card` / `model` | 카드가 실제로 그리는 5개 필드만 받는 뷰 타입                                                                     |
| `store/cartStore.ts`                                                                                                       | `entities/cart/model/cart-store.ts`                            | `entities` / `cart` / `model`         | 상태는 entity, 상태를 바꾸는 행위는 feature                                                                      |
| `store/wishlistStore.ts`                                                                                                   | `entities/wishlist/model/wishlist-store.ts`                    | `entities` / `wishlist` / `model`     | 위와 같음                                                                                                        |
| `components/ui/header/*`                                                                                                   | `widgets/header/*`                                             | `widgets` / `header` / —              | cart·wishlist 두 슬라이스를 조합하는 독립 블록                                                                   |
| `components/ui/productGrid/ProductGrid.tsx`(+css)                                                                          | `features/product-card/ui/ProductGrid.tsx`(+css)               | `features` / `product-card` / `ui`    | 카드 하나를 격자로 뿌리는 map. 조합 슬라이스가 하나라 widget 기준에 미달                                         |
| `components/ui/productGrid/ProductGridSkeleton.tsx`(+css)                                                                  | `features/product-card/ui/`                                    | `features` / `product-card` / `ui`    | `ProductGrid.module.css`의 격자 레이아웃을 참조한다                                                              |
| `components/ui/categorySection/*`                                                                                          | `_pages/home/ui/CategorySection.tsx`(+css)                     | `_pages` / `home` / `ui`              | 소비처가 홈 하나뿐                                                                                               |

### 애매한 파일 결정표 (5개 이상)

과제가 지정한 4개 + 이 프로젝트에서 실제로 갈리는 것들. 후보만 적어두고 **최종 결정과 기준은 직접 채운다.**

| 대상                                                                                        | 후보 A                       | 후보 B                          | 최종 결정                                                                                                    | 기준                                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `ProductCard`                                                                               | `entities/product/ui`        | `widgets/product-card`          | **둘 다 아님 — `features/product-card`**                                                                     | 카드 없이 행위만, 행위 없이 카드만 쓰는 자리가 실제로 있는가 |
| 상품 목록 queryOptions                                                                      | `entities/product/api`       | 상품 목록 페이지의 `api`        |                                                                                                              | 여러 페이지에서 재사용되는가                                 |
| 장바구니 store                                                                              | `entities/cart/model`        | 장바구니 행위 feature의 `model` | **A**                                                                                                        | 상태가 나타내는 도메인과 행위의 경계                         |
| `types/commerce.ts`의 `Product` 타입                                                        | `entities/product/model`     | `shared/types` 유지             | **A** (3단계에서 분해)                                                                                       | 도메인 타입을 한 창고에 모을 때 생기는 결합                  |
| `createCollectionStore` (cart·wishlist 공통 팩토리)                                         | `shared/lib`                 | 두 entity 중 한쪽에 두고 공유   | **A**                                                                                                        | 두 도메인이 같은 구현을 나눠 쓸 때의 소유자                  |
| `service/products/searchParams.ts` (nuqs parser + SORT_OPTIONS)                             | `_pages/product-list/model`  | `shared/config`                 |                                                                                                              | URL 스키마가 화면 고유인가 공통 계약인가                     |
| `usePagination` / `useProductFilters`                                                       | `features/filter-products`   | `_pages/product-list/model`     |                                                                                                              | 한 페이지 전용 로직도 feature여야 하는가                     |
| `Header` (store 2개 구독 + 내비게이션)                                                      | `widgets/header`             | `shared/ui` + 조합              | **A**                                                                                                        | 공용 UI에 비즈니스 로직을 넣지 않는다는 규칙                 |
| `getApiBaseUrl` / `queryClient.ts`                                                          | `shared/api`                 | `_app`                          | **A**                                                                                                        | 앱 배선인가 재사용 유틸인가                                  |
| 미사용 자산 (`select` 3종·`dialog`·`useSelect`·`product-options`·`formatPrice`·`isSoldOut`) | `shared`로 이동              | 삭제 또는 현 위치 보류          | **B 삭제** (단 `formatPrice`는 제외 — `shared/lib`로 옮기고 `ProductCard` 호출부를 교체해 소비처를 만들었다) | 소비처가 0인 코드의 소유자는 누구인가                        |
| `app/api/**` (mock 백엔드)                                                                  | 전환 범위 제외(현 위치 유지) | `shared/api`로 이동             | **A** (`MockApiScenario`도 여기 남긴다)                                                                      | 프론트엔드와 mock 백엔드의 경계                              |
| `hydration-demo` 라우트                                                                     | 유지                         | 삭제                            | **B 삭제**                                                                                                   | 5주차 실험용 라우트를 계속 둘 것인가                         |

### 마이그레이션 단계와 검증

| 단계 | 옮기는 대상                                                                                                                                                                                                                                    | 검증 방법                                                                                        | 결과                                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `_app`(providers·globals.css·root error fallback), `_pages/home`, `_pages/product-list`. 라우팅 파일은 default re-export만 남김. `hydration-demo` 삭제                                                                                         | `pnpm lint`, `pnpm exec tsc --noEmit`, `boundaries/dependencies` 발동 확인, 잔여 참조 grep       | 정적 검사 둘 다 통과. 규칙 검증에서 `entities → _pages`와 `_pages/home → _pages/product-list` 두 위반 모두 레이어·슬라이스가 찍힌 에러로 잡힘. 런타임 검증은 미실행(승인 대기) |
| 2    | `shared/api`(query-client·get-api-base-url), `shared/lib`(create-collection-store·format-price·use-debounced-callback), `shared/ui`(PageContainer·Pagination). 도달 불가 자산 삭제, `ProductCard`의 인라인 가격 포맷을 `formatPrice`로 교체    | `pnpm lint`, `pnpm exec tsc --noEmit`, `boundaries/dependencies` 발동 확인, 잔여 참조 grep       | 정적 검사 둘 다 통과. `shared → _pages` 위반이 레이어명이 찍힌 에러로 잡힘. `@/utils`·`@/hooks`·`@/service/queryClient` 잔여 참조 0건. 런타임 검증은 미실행(승인 대기)         |
| 3    | `entities/product`(타입 2개), `entities/cart`·`entities/wishlist`의 store. `types/commerce.ts` 분해 후 삭제                                                                                                                                    | `pnpm lint`, `pnpm exec tsc --noEmit`, `boundaries/dependencies` 발동 확인, persist 키 grep      | 정적 검사 둘 다 통과. `entities/product → entities/cart` 교차 참조가 슬라이스명까지 찍힌 에러로 잡힘. persist 키 `cart`·`wishlist` 그대로. 런타임 검증은 미실행(승인 대기)     |
| 4    | `features/product-card`(ProductCard·ProductCardActions·useProductCardActions·types). 3단계와 한 커밋으로 합쳤다 — ProductCard가 entities를 거치지 않고 바로 features로 가서, 나누면 ProductGrid가 없는 경로를 가리키는 깨진 중간 커밋이 생긴다 | 위와 같음 + `entities → features` 역방향 확인                                                    | 정적 검사 통과. `entities/product → features/product-card`가 레이어·슬라이스가 찍힌 에러로 막힘. `features`·`entities` 안에서 상위 레이어·옛 폴더 참조 0건                     |
| 5    | `widgets/header`. `ProductGrid`·`ProductGridSkeleton`은 widget 기준에 미달해 `features/product-card`로, `CategorySection`은 `_pages/home/ui`로                                                                                                 | `pnpm lint`, `pnpm exec tsc --noEmit`, `boundaries/dependencies` 발동 확인, Public API 우회 grep | 정적 검사 둘 다 통과. `features → widgets` 역방향이 레이어·슬라이스가 찍힌 에러로 막힘. Public API 우회 0건. 옛 `src/components`에는 `HeroBanner`만 남음(6단계)                |

---

## D — Data Model

### 상태 분류표

Source of Truth와 소비처는 5주차 결정을 유지한다(폴더 이동으로 바뀌지 않는다). 소유 슬라이스만 이번에 정한다.

| 상태                | Source of Truth     | 소유 슬라이스/레이어 | 소비하는 곳        | 이동 후에도 중복 저장하지 않는 방법                                                                                           |
| ------------------- | ------------------- | -------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 상품 조회 결과      | 서버/TanStack Query | _(미정)_             | 홈, 상품 목록      | 응답을 store에 옮겨 담지 않는다. 서버·클라이언트가 **같은 `queryOptions`** 를 import해 캐시를 공유한다.                       |
| 검색·정렬·페이지    | URL/nuqs            | _(미정)_             | 상품 목록          | `productListParsers` 한 곳만 정의하고, 별도 `useState`로 미러링하지 않는다. 입력창의 타이핑 중 값만 DOM(비제어 input)에 둔다. |
| 장바구니·위시리스트 | Zustand             | _(미정)_             | 헤더, 상품 행위 UI | 개수를 저장하지 않고 `ids.length`로 파생한다. persist 저장 키(`cart`·`wishlist`)를 유지한다.                                  |
| Dialog 열림 여부    | React 로컬 상태     | _(미정)_             | 해당 UI            | `components/ui/dialog`는 현재 라우트에서 쓰이지 않는다. 배치 결정 전까지 상태 소유자도 미정.                                  |

> 폴더를 옮기면서 서버 응답을 Zustand에 복사하거나, URL 상태를 별도 `useState`에 동기화하지 않는다.

---

## I — Interface

### 슬라이스별 공개 / 비공개

| 슬라이스 | 공개하는 값 | 숨기는 구현 세부 | 이유 |
| -------- | ----------- | ---------------- | ---- |

### `ProductCard` + 장바구니·위시리스트 조합 방법

- 조합 위치:
- 방식:
- `entities → features` 역방향 import를 피한 방법:

### Public API 결정

- barrel file과의 차이에 대한 이해:
- 선택:
- 의도와 근거:

---

## O — Optimization

**TanStack Query 캐시 정책** — 현재 값을 그대로 유지한다. 폴더 위치와 캐시 정책은 무관하고, 값을 함께 바꾸면 구조 변경 때문에 생긴 차이인지 구분할 수 없다.

| 쿼리      | staleTime          | 그 외                               | 근거 (5주차 결정)                        |
| --------- | ------------------ | ----------------------------------- | ---------------------------------------- |
| 홈        | 1분                | 서버 prefetch + hydrate             | 인기·신상품의 최신 노출이 중요           |
| 상품 목록 | 5분                | `placeholderData: keepPreviousData` | 같은 검색·필터 결과를 재사용해 요청 감소 |
| 공통      | gcTime 기본값(5분) | —                                   | 별도로 조정할 근거가 아직 없음           |

**로딩 경계 범위** — 현재 세 층이 각각 다른 범위를 맡는다.

| 수단                | 담당 범위                                | 현재 위치                                                   |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `loading.tsx`       | 홈 라우트 전체(서버 렌더 대기)           | `app/(home)/loading.tsx` → `_pages/home/ui/HomeLoading.tsx` |
| `<Suspense>`        | 상품 목록에서 URL을 읽는 Client 서브트리 | `_pages/product-list/ui/ProductListPage.tsx`                |
| Query `isPending`   | 목록 데이터의 최초 로드(스켈레톤)        | `_pages/product-list/ui/ProductListResults.tsx`             |
| `isPlaceholderData` | 조건 전환 중(이전 목록 유지, 흐리게)     | `_pages/product-list/ui/ProductListResults.tsx`             |

목록에 `loading.tsx`가 없는 이유: 목록은 URL 조건이 바뀔 때마다 재조회되는데 라우트 로딩 UI를 쓰면 조건을 바꿀 때마다 화면이 통째로 스켈레톤으로 바뀐다. 이전 목록을 유지하는 편이 낫다고 판단해 컴포넌트 단위(`isPending`/`isPlaceholderData`)로 처리한다. `products/page.tsx`의 `<Suspense>`는 로딩 표현이 아니라 `useSearchParams`에 필요한 **경계**다.

**에러 경계 범위** — 위 4단계 표 참조. 홈은 라우트 경계, 목록은 컴포넌트 인라인.

**이번 주에 하지 않을 최적화와 이유**

_(AI 초안 — 검토 후 확정할 것)_

- 상품 목록 서버 prefetch — URL 조건마다 결과가 달라 이득을 따져봐야 하는 별개 주제.
- `select`를 이용한 리렌더 격리 — 소비처가 하나뿐이라 지금은 이득이 없다(5주차 판단 유지).
- 번들 분할·이미지 최적화 — 측정한 성능 문제가 없다. 근거 없는 최적화는 구조 변경의 검증을 방해한다.
- Public API(`index.ts`) 도입으로 인한 번들 영향 — 도입 여부 자체가 3단계 결정 사항이라 그 결정 뒤에 본다.

---

## 4단계 — 에러 처리 경계

### 에러 처리 표

구조 변경 후 기준이다. 경계 **자체**는 5주차와 같고 위치만 새 레이어로 옮겼다. 상태 코드로 경계를 가를지는 과제 4단계에서 정한다.

| 실패 유형                     | 처리 위치                                                          | Error Boundary로 전파하는가                    | 사용자 UI                                               | 재시도 방법                      | 이 경계를 선택한 이유                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상품 목록 조회 실패           | `_pages/product-list/ui/ProductListResults.tsx`의 `isError` 분기   | 아니오 (`useQuery`는 throw하지 않고 `isError`) | `상품 목록을 불러오지 못했어요.` + `다시 시도`          | `refetch()` (전체 새로고침 없음) | 필터 UI를 남겨야 사용자가 조건을 바꿔 실패에서 빠져나갈 수 있다. 목록만 실패했는데 화면 전체를 덮지 않는다.                                                                  |
| 잘못된 검색 조건(4xx)         | 1차는 nuqs parser, 그래도 뚫리면 위와 같은 인라인 경로             | 아니오                                         | 허용 밖 `category`·`sort`는 기본값으로 조용히 복구      | 조건 변경                        | 사용자가 URL을 직접 고칠 수 있는 값이라, 에러 화면보다 기본값 복구가 낫다. 숫자 범위 위반(`page=0`)만 400 → 인라인 에러로 노출.                                              |
| 예상하지 못한 렌더링 오류     | `_app/ui/RootErrorFallback.tsx` (루트 `app/error.tsx`가 re-export) | 예                                             | `문제가 발생했어요` + `오류 코드`(digest) + `다시 시도` | `reset()`                        | 어디서 날지 모르는 오류라 라우트 경계에서 받는다. 홈은 `useSuspenseQuery`라 조회 실패도 여기로 온다.                                                                         |
| 홈 데이터 조회 실패           | `_app/ui/RootErrorFallback.tsx` (루트 `app/error.tsx`가 re-export) | 예 (`useSuspenseQuery`가 throw)                | 위와 동일                                               | `reset()`                        | 홈은 라우트 전체가 이 데이터에 의존해 부분 표시가 의미 없다. 목록과 정반대 선택이고, 그 이유가 "화면이 데이터에 얼마나 의존하는가"다.                                        |
| 장바구니 행위의 비즈니스 오류 | **해당 없음**                                                      | —                                              | —                                                       | —                                | 현재 장바구니·위시리스트는 서버 통신 없이 로컬 상태만 토글한다. 실패 경로가 존재하지 않는다. **서버 저장이나 재고 검증이 생기면** 그때 이벤트 핸들러에서 처리할 대상이 된다. |

### `throwOnError` 기준

- 현재 코드에는 `throwOnError` 설정이 **없다.** 대신 훅 종류로 경계가 갈린다.
  - 경계로 전파: 홈 — `useSuspenseQuery`가 실패 시 throw → 루트 `error.tsx`
  - 인라인 처리: 상품 목록 — `useQuery`의 `isError`를 컴포넌트가 직접 그림
- 과제가 요구하는 `5xx는 경계로 / 4xx·빈 결과는 화면 안에서` 기준을 적용하려면 목록 쪽에 상태 코드 구분이 필요하다. 현재 `getProductList`는 `!response.ok`를 **하나의 `Error`로 뭉쳐서** 던지므로(`상품 목록을 불러오지 못했습니다 (status: N)`), 상태 코드로 갈라내려면 에러 타입 분리가 선행되어야 한다. _(적용 여부 미정 — 과제 4단계에서 다룬다)_

### 이벤트 핸들러·비동기 콜백 오류

Error Boundary가 잡지 못하는 이유: React의 Error Boundary는 **렌더링·라이프사이클·자식 생성자**에서 던져진 오류만 잡는다. 이벤트 핸들러와 `setTimeout`·`Promise` 콜백은 React의 렌더 스택 밖에서 실행되므로 경계를 통과하지 못하고 그대로 전역(`window.onerror` / `unhandledrejection`)으로 빠진다.

현재 프로젝트에서의 처리 위치:

- 찜·담기 토글: 동기 로컬 상태 변경이라 실패 경로 없음. _(서버 통신이 붙으면 핸들러 안에서 `try/catch` + 사용자 피드백으로 처리)_
- `refetch()`: TanStack Query가 결과를 `isError`로 되돌려주므로 콜백에서 던지지 않는다.
- debounce 콜백(`useDebouncedCallback`): 안에서 하는 일이 nuqs 세터 호출뿐이라 던지지 않는다.

### 실패 재현 결과

| 시나리오 | 재현 방법 | 관찰한 동작 | 판정 |
| -------- | --------- | ----------- | ---- |

> 임시 `throw`로 검증했다면 제거 여부를 여기에 적는다.

---

## 5단계 — 삭제 시나리오 자가 검증

### 위시리스트 기능을 통째로 제거한다면

- 삭제할 폴더·파일:
- 삭제 후 수정이 필요한 파일:
- 응집 판정 (grep 없이 다 찾을 수 있는가):

### 신상품 뱃지를 상품 카드에 추가한다면

- 터치할 파일:
- 판정:

### 발견한 파편화

| 파편화 내용 | 이번 주에 고칠 것 / 남길 것 | 근거 |
| ----------- | --------------------------- | ---- |

---

## Advanced (선택)

### A. 의존성 하네스

- 선택 여부:
- 도구와 규칙:
- 실패/통과 결과:

### B. 변경 반경 실험

- 추가한 요구사항:
- 구현 전 예상:

| 관점              | 구현 전 예상 | 실제 결과 | 차이가 난 이유 |
| ----------------- | ------------ | --------- | -------------- |
| 수정한 슬라이스   |              |           |                |
| 변경한 Public API |              |           |                |
| 새로 생긴 의존    |              |           |                |

---

## FSD 이해 확인 질문

각 2~4문장으로 답한다.

1. `ProductCard`가 찜 버튼을 직접 import하면 어떤 의존 규칙을 어기며, 어디에서 조합해야 하는가?

2. 한 페이지에서만 쓰는 검색 로직도 반드시 feature여야 하는가? 내 프로젝트에서는 어떻게 결정했는가?

3. `formatPrice`는 항상 `shared/lib`인가? 통화·회원 등급·상품 정책이 포함되면 결정이 어떻게 달라지는가?

4. 두 feature가 협력해야 할 때 직접 import하지 않고 어떤 상위 레이어에서 조합했는가?

5. 폴더 이동 후에도 TanStack Query 데이터와 Zustand 데이터를 서로 복사하지 않은 이유는 무엇인가?

6. barrel file과 Public API는 무엇이 다른가? 내 프로젝트에서는 어느 쪽을 선택했고 그 의도는 무엇인가?

---

## AI 리뷰 기록

| AI가 지적한 내용 | 수용 / 반려 | 근거 |
| ---------------- | ----------- | ---- |

---

> 이 문서의 골격(제목·표 헤더·질문)은 AI(Claude)가 `docs/assignments/week-06.md`의 요구 항목을 기준으로 생성했습니다.
>
> 구조 변경 전 시점에 AI가 채운 부분은 다음과 같습니다.
>
> - **측정값**: 0단계의 자동 검증 결과(`pnpm check`·`pnpm test:e2e` 실행 결과와 플레이키 판정)
> - **현재 코드에서 읽어낸 사실**: 기능 요구사항 표, Before 폴더 트리, 에러 처리 표의 현재 구현 동작, 로딩 경계 구분, 캐시 정책 현재 값, E2E 커버 범위
> - **원인 분석**: `리팩토링 중 발견한 기존 버그`의 홈 에러 재시도 건. 증상 관찰과 "고치지 않고 기록만 한다"는 결정은 작성자가 했고, react-query 소스 대조를 통한 원인 규명은 AI가 했습니다.
> - **AI 초안(검토 필요)**: `현재 구조에서 실제로 겪는 문제`, `이번 주에 하지 않을 것`, `하지 않을 최적화`, 애매한 파일 결정표의 **후보 열**
>
> `_(미정)_` 표시가 있는 칸과 FSD 이해 확인 질문의 답변은 작성자가 직접 채웁니다. AI 초안 항목은 그대로 제출하지 않고 검토 후 본인 판단으로 확정합니다.
