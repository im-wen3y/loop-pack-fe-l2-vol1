# FSD 전환 프로세스 초안

> 상태: 초안 · 작성 시점의 코드는 **전환 전**(`src/{app,components,service,store,hooks,types,utils}`)
>
> 무엇을 어디로 옮기는지(목표 구조·파일 매핑)는 [`docs/rfc/week06-fsd.md`](../rfc/week06-fsd.md)에 있고, 이 문서는 **어떤 순서로 어떻게 옮길지**와 각 단계에서 **무엇을 먼저 결정해야 하는지**를 다룬다.

## 진행 원칙

1. **한 단계씩 끊는다.** 한 번에 여러 레이어를 옮기면 회귀가 나도 어느 이동 때문인지 판정할 수 없다.
2. **단계마다 결정을 먼저 한다.** 파일을 옮기기 전에 그 단계에서 갈리는 지점을 정하고 근거를 남긴다. 옮기면서 정하면 "옮기기 쉬운 쪽"이 근거를 대신한다.
3. **라우팅 껍질을 먼저 분리하고, 구현은 아래 레이어부터 위로 옮긴다.** Next.js 특수 파일을 얇게 만드는 1단계 뒤에는 `shared → entities → features → widgets → _pages` 순서를 지킨다. 전환 중 `_pages`가 아직 기존 폴더를 참조하는 것은 임시 상태로 기록하고, 마지막에 잔여 참조가 없는지 확인한다.
4. **단계마다 정적 검사를 통과한 상태로 커밋한다.** lint·typecheck가 깨진 중간 커밋을 만들지 않는다. 프로덕션 빌드 통과 여부는 사용자 승인 후 실행하는 검증 단계에서 별도로 판정한다.
5. **동작은 바꾸지 않는다.** 이동과 기능 변경을 같은 커밋에 섞지 않는다. 이동 중 발견한 버그는 따로 기록하고 별도 커밋으로 처리한다.

## 단계별 절차 (각 단계에서 반복)

```
① 결정 재확인       → 0.5단계에서 정한 목표 위치와 근거를 해당 단계에서 재확인한다
② 파일 이동        → git mv 로 이력 유지, import 경로 갱신
③ 정적 검사        → pnpm lint && pnpm exec tsc --noEmit
④ 규칙 검증        → 위반 import를 임시 파일로 만들어 lint가 잡는지 확인 후 삭제
⑤ 기록            → RFC의 파일 매핑표·단계 표에 결과 반영
⑥ 커밋            → 이동과 삭제처럼 성격이 다른 변경은 논리 단위로 나눠 커밋한다
```

④는 매 단계 하지 않아도 된다. 새 레이어가 처음 생기는 단계(1~5단계)에서 한 번씩 확인한다. 현재 boundaries 설정은 전환 전 폴더를 검사 범위에 포함하지 않으므로, lint 통과만으로 기존 폴더 의존이 모두 사라졌다고 판단하지 않는다.

## 0단계 — 기준선 (완료)

- 자동: `pnpm check` 통과, `pnpm test:e2e` 40/40. 상세와 플레이키 1건 판정은 RFC 0단계에 기록됨.
- 수동: M1~M9 관찰값 기록됨.
- 이 값들과 대조하는 최종 검증은 마지막 단계 후에 한 번 한다.

## 0.5단계 — 목표 구조와 파일 매핑 확정

실제 이동을 시작하기 전에 아래 모든 단계의 "결정할 것" 표와 RFC의 파일 매핑표를 먼저 채운다. 현재 단계에 없는 레이어가 최종 위치로 결정되더라도 그 파일은 해당 레이어 단계까지 기존 위치에 둔다. 예를 들어 `ProductCard`를 widget으로 결정했다면 entities 단계에서 임시로 옮기지 않고 widgets 단계에서 한 번만 이동한다.

이 단계에서 함께 결정한다.

- 각 파일의 최종 레이어·슬라이스·세그먼트
- 슬라이스 외부 공개 경로와 server/client 공개 경계
- 전환 중에만 허용할 기존 폴더 import 목록과 제거 예정 단계
- 사용자 승인이 필요한 단계별 런타임 검증 범위

## 1단계 — `_app`·`_pages` 도입, 라우팅 진입점 얇게

FSD의 `app` 레이어가 Next.js App Router의 `app` 디렉터리와 충돌하므로 [FSD Next.js 가이드](https://feature-sliced.design/docs/guides/tech/with-nextjs)대로 `_app`·`_pages`를 쓴다.

**결정할 것**

| 갈림길                                | 후보                                                      | 결정                                                                                                                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 라우터 위치                           | 루트 `app/` / `src/app` 유지                              | **점진 이동.** 이번 단계에서는 `src/app`을 유지하고 내용물만 비운다. 전환이 끝나 라우팅 껍질만 남으면 루트 `app/`으로 옮기는 것이 최종 목표다. 라우터 이동과 레이어 이동을 같은 diff에 섞으면 회귀 판정이 흐려진다.                                               |
| `loading.tsx`·`error.tsx`의 UI 소유자 | 라우팅 파일에 유지 / `_pages`·`_app`으로 내리고 re-export | **내리고 re-export.** 1단계의 목적 자체가 라우팅 진입점을 얇게 만드는 것이다. `page.module.css`도 유일 소비자인 error fallback을 따라가 `RootErrorFallback.module.css`가 됐다.                                                                                    |
| `hydration-demo` 라우트               | 유지 / 삭제                                               | **삭제.** 5주차 실험 결과는 `docs/week-05/hydration-test.md`와 `ProductCardActions`·`Header` 주석에 남아 있고, 파일 주석에도 "확인 후 삭제해도 되는 라우트"라고 적혀 있었다. 유지하면 데모 전용 `_pages` 슬라이스를 하나 더 이고 간다.                            |
| 슬라이스 Public API                   | `index.ts`·`index.server.ts` 도입 / 직접 공개 경로 사용   | **`index.ts` 도입**(슬라이스 루트 한 겹). `_app`은 슬라이스가 없고 `globals.css`는 배럴을 통과할 수 없어 직접 경로를 쓴다. `index.server.ts`는 현재 서버 전용 모듈이 `getServerQueryClient` 하나뿐이라 만들지 않고, 서버 전용 면이 늘어나는 6단계에서 재검토한다. |

**이동 대상**

- `app/providers.tsx` → `_app/providers/`, `app/globals.css` → `_app/styles/`
- `app/error.tsx`의 fallback → `_app/ui/`, 함께 쓰이던 `page.module.css`도 이름을 맞춰 이동
- `page.tsx`·`loading.tsx`·`error.tsx` 등 Next.js 특수 파일을 제외한 `app/(home)/**`, `app/products/**`의 화면 구현 → `_pages/home`, `_pages/product-list`
- 라우팅 파일에 남길 것: `html`·`metadata`·폰트 설정, `export const dynamic` 같은 라우트 세그먼트 설정

**주의**

- 라우팅 파일은 default export가 필요하다. `export { X as default } from '...'` 형태로 남기고, `error.tsx`에는 `'use client'`를 유지한다.
- Public API를 도입하면 편의성 배럴과 슬라이스 외부 공개 계약을 구분한다. Client Component가 사용하는 `index.ts`에서 server-only 모듈을 함께 export하지 않고, 필요하면 `index.server.ts`로 분리한다. 기존의 "배럴 파일 지양" 규칙에 예외를 둘 경우 RFC에 범위와 이유를 명시한다.
- 삭제한 라우트가 있으면 `.next/types`의 생성물이 남아 `tsc`가 실패한다. `.next/types`·`.next/dev/types`를 지우고 재검사한다.
- 라우트를 삭제하면 `pnpm build`의 라우트 개수가 기준선과 달라진다. 회귀가 아니라는 근거를 RFC 0단계에 적어둔다.

## 2단계 — `shared`

**결정할 것**

| 갈림길                                          | 후보                                        | 결정                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API 계약 타입(`types/commerce.ts`) 소유자       | `entities/*/model` 분해 / `shared/api` 한곳 | **분해.** 도메인 타입(`Product`·`Category`·`CategoryId`·`ProductSort`)은 `entities/product/model`, 응답 봉투(`HomeResponse`·`ProductListResponse`)는 그 응답을 조회하는 쪽이 소유한다. `shared`에 두면 RFC A 섹션 4번이 지적한 "여러 도메인의 타입 창고"가 이름만 바꿔 그대로 남는다. 실제 분해는 3단계(entities)에서 한다                          |
| mock 전용 타입(`MockApiScenario` 등)            | `shared`로 함께 / `src/app/api` 안에 남김   | **`src/app/api` 안에 남김.** Route Handler와 fixture만 소비하고, `service/*/model.ts` 주석에도 "클라이언트에서 보내지 않는다"고 적혀 있다. 프론트엔드 레이어의 자산이 아니라 mock 백엔드의 내부 계약이다                                                                                                                                            |
| `queryClient.ts`                                | `shared/api` / `_app`                       | **`shared/api/query-client.ts`.** `_app`은 구조적으로 불가능하다 — 유일 소비처가 `_pages/home`인데 `_app`은 상위 레이어라 `boundaries/dependencies`가 역방향으로 막는다. 클라이언트 쪽 짝(`Providers`의 `useState` QueryClient)이 `_app`에 남아 둘이 갈라지는 것은 감수한다                                                                         |
| `createCollectionStore`(cart·wishlist 공통)     | `shared/lib` / 두 entity 중 한쪽            | **`shared/lib/create-collection-store.ts`.** 한쪽 entity에 두면 다른 entity가 같은 레이어의 다른 슬라이스를 참조해야 하고, `@x`는 타입 전용이라 `create` 함수 같은 런타임 구현은 공개 대상이 아니다. 내용도 "id 집합 + 토글 + persist 복구"라 도메인 지식이 없다                                                                                    |
| 소비처 0인 자산(select 3종·dialog·useSelect 등) | `shared`로 이동 / 현 위치 보류 / 삭제       | **삭제.** select 3종·`SelectToggleIcon`·`dialog`·`useSelect`·`product-options`·`isSoldOut`이 서로만 참조하는 닫힌 섬이라 어떤 라우트에서도 도달할 수 없다. 재사용 범위를 판단할 근거가 없어 `shared` 배치가 정당화되지 않고, `product-options.ts`는 `commerce.ts`와 이름이 같은 별개의 `Product`를 선언하고 있어 옮기면 타입 소유권이 더 모호해진다 |
| `shared/ui` 폴더 구조                           | 현재처럼 컴포넌트별 폴더 / 파일 평면 배치   | **컴포넌트별 폴더 유지**(폴더명은 컴포넌트명과 일치). 거의 모든 컴포넌트가 같은 이름의 `.module.css`를 달고 다녀서, 평면 배치는 tsx와 css를 한 폴더에 섞는다                                                                                                                                                                                        |

**확인 포인트**

- `shared`에 들어가면 안 되는 것: 화면 문구와 특정 도메인의 행위·정책. `staleTime` 같은 캐시 정책은 해당 `queryOptions`와 같은 위치에 둔다. 캐시 정책이 상품·홈 도메인에 종속적이라면 query factory 자체를 `shared`에 두지 않는다.
- 소비처가 0인 코드는 재사용 범위를 판단할 근거가 없다. 이동·보류·삭제 중 무엇을 택하든 근거를 RFC에 남긴다.
- `utils/formatPrice`처럼 "있는데 안 쓰는" 유틸은 이동과 함께 호출부를 교체할지 정한다(인라인 `toLocaleString` 제거).

## 3단계 — `entities`

**결정할 것**

| 갈림길                    | 후보                                           | 결정                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 장바구니·위시리스트 store | `entities/*/model` / 행위 feature의 `model`    | **`entities/cart/model`·`entities/wishlist/model`.** 소비처가 둘인데 성격이 다르다 — `ProductCardActions`는 토글 행위지만 `Header`는 개수를 읽기만 한다. store를 feature에 두면 Header가 "담기 기능"을 import해야 한다. 상태는 entity, 그 상태를 바꾸는 행위는 feature로 갈라놓으면 둘 다 자연스럽게 참조한다                                                                    |
| `ProductCard`             | `entities/product/ui` / `widgets/product-card` | **`features/product-card/ui`로 결정을 바꿨다.** 처음에는 `entities/product/ui`로 옮겼는데(카드가 그리는 건 상품 표현 자체라는 이유), 실제 소비처를 세어보니 카드를 쓰는 곳은 `ProductGrid` 하나고 그 `ProductGrid`가 쓰이는 홈·목록 두 곳 모두 찜·담기를 함께 그린다. 행위 없는 카드가 필요한 자리가 없어서, 표시와 행위를 한 슬라이스가 소유하고 슬롯 배선을 만들지 않기로 했다 |
| 도메인 타입 참조 방식     | DTO 직접 사용 / 소비처가 뷰 타입을 따로 정의   | **뷰 타입 유지.** `ProductCardItem`(5개 필드)을 `features/product-card/model/types.ts`에 두고 구조적 타이핑으로 `Product[]`를 그대로 넘긴다. DTO를 받으면 카드가 쓰지도 않는 `sizes`·`rating`·`createdAt` 변경까지 영향권에 들어온다                                                                                                                                             |
| 슬라이스 분리 단위        | `product`+`category` 분리 / 한 슬라이스        | **한 슬라이스**(`entities/product`). 판단 근거는 [entity-decisions.md](./entity-decisions.md)에 별도로 정리했다. 교차 참조가 없어 `@x`는 만들지 않았다                                                                                                                                                                                                                           |

**`types/commerce.ts` 분해 결과** (2단계 결정의 실행)

| 타입                                     | 이동 위치                                   |
| ---------------------------------------- | ------------------------------------------- |
| `CategoryId`·`Category`                  | `entities/product/model/category.ts`        |
| `Product`·`ProductSort`                  | `entities/product/model/product.ts`         |
| `HomeResponse`                           | `service/home/model.ts`의 `GetHomeResponse` |
| `ProductListResponse`·`ProductListQuery` | `service/products/model.ts`                 |
| `MockApiScenario`·`ApiErrorResponse`     | `src/app/api/_types.ts`                     |

응답 봉투를 조회하는 쪽이 소유하게 되면서 Route Handler가 클라이언트 model을 import한다. 실제 백엔드였다면 클라이언트가 "기대하는 응답"을 선언하고 서버는 저장소 밖에 있었을 구조라, mock 백엔드가 그 선언을 참조하는 형태로 뒀다. 6단계에서 `service/*`가 `_pages/*/api`로 내려가면 이 import 경로가 페이지 슬라이스를 향하게 되므로, 그때 Public API로 공개할지 다시 본다.

**주의**

- **persist 저장 키(`cart`·`wishlist`)를 바꾸지 않는다.** 바뀌면 사용자의 기존 `localStorage` 값이 유실된다. → 확인함, 그대로다.
- 결과적으로 `entities/product`는 타입만 소유한다. entity에 UI가 없어도 되는가는 한 번 걸렸는데, 슬라이스가 무엇을 소유해야 하는지는 레이어가 아니라 그 도메인이 실제로 갖고 있는 것이 정한다고 봤다.
- `entities`끼리 일반 Public API나 내부 경로로 직접 import하지 않는다. 분리 뒤에도 교차 참조가 없다면 `@x`는 필요하지 않다. 다른 entity의 타입이 꼭 필요할 때만 제공 entity의 `@x/<consumer>` 경로로 필요한 타입을 공개하고, 그 전에 타입 소유자를 다시 본다.
- `'use client'` 위치를 올리지 않는다. Client 경계는 지금처럼 리프에 둔다.

## 4단계 — `features`

**결정할 것**

| 갈림길                         | 후보                                                  | 결정                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProductCardActions` 분리 단위 | 한 슬라이스에 두 버튼 / 도메인별 2슬라이스            | **한 슬라이스에 두 버튼**(`features/product-card`). 도메인별 2슬라이스는 삭제 시나리오가 깔끔해지지만, 버튼 두 개를 위해 슬라이스가 둘이 되고 공유하는 버튼 스타일의 소유자가 애매해진다. store 구독은 `useProductCardActions` 하나로 모으고, 위시리스트만 떼어낼 일이 생기면 그때 훅과 슬라이스를 함께 가른다 |
| 버튼 스타일 소유자             | 각 feature의 UI / 도메인 비종속 `shared/ui` primitive | **feature의 UI**(`features/product-card/ui/ProductCard.module.css`). 카드와 버튼이 원래 한 CSS 모듈을 나눠 쓰고 있었고, 같은 슬라이스로 들어오면서 그 공유가 슬라이스 안쪽 일이 됐다. 버튼 primitive를 `shared/ui`에 만들 근거(두 번째 소비처)는 아직 없다                                                     |

**확인 포인트**

- `entities → features` 역방향 import가 없어야 한다. 이 단계가 그 규칙을 실제로 증명하는 지점이다. → `entities/product`에서 `@/features/product-card`를 import하는 임시 파일로 확인했고, 레이어·슬라이스가 찍힌 에러로 막혔다.
- 삭제 시나리오를 미리 그려본다: "위시리스트를 통째로 지운다"면 어떤 폴더가 사라지고 어떤 파일이 수정되는가. → 지금 구조에서는 `entities/wishlist/` 폴더가 사라지고, `features/product-card`의 `useProductCardActions`와 `ProductCardActions`, 그리고 `Header`를 수정한다. 폴더 하나 삭제로 끝나지 않는 건 찜과 담기를 한 훅에 모은 결과다. 5단계 자가 검증에서 이 답을 그대로 쓴다.

## 5단계 — `widgets`

**결정할 것**

원래 표의 "카드 + 행위 조합 지점 / 조합 방식 / 조합 레이아웃 소유자" 3건은 **없어진 갈림길**이다. 4단계에서 `features/product-card`가 표시와 행위를 함께 소유하기로 하면서 조합 지점 자체가 사라졌다. 대신 옛 폴더에 남아 있던 파일들의 자리를 여기서 정했다.

| 갈림길                | 후보                                                 | 결정                                                                                                                                                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`              | `widgets/header` / `shared/ui` + 개수 props          | **`widgets/header`.** `entities/cart`와 `entities/wishlist` 두 슬라이스를 구독하고 내비게이션까지 갖는 독립 블록이다. 이 프로젝트에서 "여러 하위 슬라이스를 조합한다"는 widget의 정의에 맞는 유일한 후보였다. `shared/ui` + props로 빼면 두 페이지가 각자 store를 구독해 개수를 넘겨야 하고, Client 경계가 페이지 쪽으로 올라간다 |
| `ProductGrid`         | `widgets/product-grid` / `features/product-card` 안  | **`features/product-card` 안.** 확인 포인트가 "entity UI 하나를 감싸기 위한 중간 폴더로 widget을 만들지 않는다"인데, 이 그리드가 하는 일이 정확히 `ProductCard` 하나를 격자로 뿌리는 `map` 한 줄이다. 조합하는 슬라이스가 하나뿐이라 widget 기준에 미달한다                                                                       |
| `ProductGridSkeleton` | `shared/ui` / `ProductGrid`와 같은 곳                | **`ProductGrid`와 같은 곳.** 스켈레톤이 `ProductGrid.module.css`의 격자 레이아웃을 그대로 참조한다(로딩 → 완료 전환의 깜빡임을 줄이려고 일부러 맞춘 것). 떼어 놓으면 두 레이어가 CSS 하나를 나눠 쓰게 된다                                                                                                                        |
| `CategorySection`     | `entities/product/ui` / `_pages/home/ui` / `widgets` | **`_pages/home/ui`.** 소비처가 `HomeContent` 하나뿐이다. 도메인 표현으로 보면 `entities/product/ui`도 맞지만, 재사용 근거가 생기기 전에는 소비하는 화면이 갖는다는 이번 주의 다른 판단들과 같은 기준을 적용했다. 목록 화면에도 카테고리 UI가 필요해지면 그때 내린다                                                               |

**확인 포인트**

- widget은 여러 하위 슬라이스를 조합하는 독립 UI 블록일 때만 만든다. entity UI 하나를 감싸기 위한 중간 폴더로 만들지 않는다. → 이 기준을 적용한 결과 widget은 `header` 하나만 생겼다. `ProductGrid`는 이 기준에서 걸러졌다.
- 조합 지점이 자손의 내부 클래스명에 의존하지 않게 하고, 슬롯·props 또는 도메인 비종속 UI primitive로 스타일 계약을 드러낸다. → 조합 지점이 사라져 해당 없음. 다만 `ProductGridSkeleton`이 `ProductGrid.module.css`를 참조하는 건 남았다. 같은 슬라이스 안이라 경계 위반은 아니고, 격자 크기를 두 곳에 복사하지 않으려는 의도적 공유다.
- `features → widgets` 역방향 import가 없어야 한다. → `features/product-card`에서 `@/widgets/header`를 import하는 임시 파일로 확인했고, 레이어·슬라이스가 찍힌 에러로 막혔다.

## 6단계 — 페이지 슬라이스의 `api`·`model`

**결정할 것**

| 갈림길                              | 후보                                                               | 결정                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| query factory 위치                  | `shared/api` 컨트롤러별 / `entities/*/api` / 소비 페이지 `api`     | **`shared/api` 컨트롤러별** (`shared/api/home`, `shared/api/product`) — 재사용성 높음, ESLint 경계 위반은 `eslint-disable` 처리 |
| `searchParams.ts`                   | 한 파일 유지 / URL 파서와 요청 직렬화로 분리                       | **한 파일 유지**, `_pages/product-list/model/search-params.ts` — 페이지 전용 설정이라 상향 의존 허용                            |
| `usePagination`·`useProductFilters` | `features/filter-products` / 페이지 `model`                        | **split**: `usePagination` → `shared/lib` (props 리팩토링), `useProductFilters` → `_pages/product-list/model` (페이지 전용)     |
| 세그먼트 파일명                     | 현재 이름(`api`·`queries`·`service`) / FSD 예시(`get-*`·`*.query`) | **현재 이름 유지** — 도메인별 단일 controller 패턴으로 명확함                                                                   |
| `HeroBanner`                        | `shared/ui` / `_pages/home/ui`                                     | **`_pages/home/ui`** — 홈 전용 presentational component, 재사용 근거 없음                                                       |

**이동 대상**

- `service/home/*` → `shared/api/home/` (api.ts, model.ts, queries.ts, service.ts)
- `service/products/*` → `shared/api/product/` (api.ts, model.ts, queries.ts, service.ts)
- `service/products/searchParams.ts` → `_pages/product-list/model/search-params.ts` (한 파일)
- `hooks/usePagination.ts` → `shared/lib/usePagination.ts` (props 리팩토링: `pageSize` 인자 추가)
- `_pages/product-list/ui/useProductFilters.ts` → `_pages/product-list/model/useProductFilters.ts`
- `components/ui/banner/HeroBanner.tsx` → `_pages/home/ui/HeroBanner.tsx`

**확인 포인트**

- ✅ 서버 prefetch와 클라이언트 훅이 **같은 `queryOptions`** 를 참조한다. (`shared/api/*/queries.ts`)
- ✅ `shared/api/product/api.ts`가 `_pages/product-list/model/search-params.ts`를 참조하는 상향 의존은 `eslint-disable` 처리했고, 이는 page 소유 모듈이기 때문에 의도적이다.
- ✅ `usePagination`을 `shared/lib`로 옮기면서 `pageSize` prop화로 범용성 확보. 호출처에서 `PRODUCT_PAGE_SIZE` import 후 전달.
- ✅ 캐시 정책(`staleTime`·`keepPreviousData`) 값 유지. 이동 이외 기능 변경 없음.

**주의**

- query를 하위 레이어로 내릴 때 그 파일이 페이지 소유 모듈(`searchParams` 등)을 참조하는지 먼저 확인한다. 참조하면 상향 의존이 되어 lint가 막는다. (현재 단계에서 `shared/api/product/api.ts` → `searchParams` 참조로 확인됨, 의도적 eslint-disable)
- 캐시 정책(`staleTime`·`placeholderData`) 값은 건드리지 않는다. 이동 때문에 생긴 차이인지 구분할 수 없게 된다.

## 7단계 — 문서 정리

- [`docs/rfc/week06-fsd.md`](../rfc/week06-fsd.md): After 트리, 레이어 선택 근거, 허용/금지 import 예시, 파일 매핑표, 애매한 파일 결정표, 상태 분류표의 소유 슬라이스, 단계 표 결과.
- [`docs/week-06/decisions.md`](./decisions.md): 각 단계에서 갈렸던 판단을 `고민 → 선택지 → 결정 → 근거` 형식으로.
- [`docs/week-06/decisions.md`](./decisions.md)의 TanStack Query 항목: query factory와 캐시 정책의 배치 판단.
- RFC의 I 섹션(슬라이스 공개/비공개), 4단계 에러 처리 표, 5단계 삭제 시나리오는 이동이 끝난 뒤 결과를 보고 작성한다.

## 검증 계획

| 시점                            | 실행                                                                                      | 판정 기준                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| 단계마다                        | `pnpm lint`, `pnpm exec tsc --noEmit`                                                     | 둘 다 통과해야 커밋                           |
| 새 레이어                       | 위반 import 임시 파일로 `boundaries/dependencies` 발동 확인 후 삭제                       | 에러 메시지에 레이어·슬라이스가 찍힘          |
| 라우팅·entity·조합 경계 변경 후 | 표적 E2E 또는 수동 확인 _(사용자 승인 필요)_                                              | 해당 단계가 보호하는 기존 동작 유지           |
| 전체 완료 후                    | `pnpm check`, `pnpm test:e2e`, 수동 M1~M9 _(사용자 승인 필요)_                            | RFC 0단계 기준선과 관찰값 일치                |
| 전체 구조                       | 기존 `components/service/store/hooks/types/utils`를 향하는 import 및 Public API 우회 검색 | 전환 대상의 잔여 참조와 공개 계약 우회가 없음 |

정적 검사로는 잡히지 않는 것 — persist 키 유지, hydration 일치, Client 경계 위치, 라우트 구성. 이것들은 사용자 승인을 받은 단계별 또는 최종 런타임 대조에서 확인한다.

단계별 런타임 검증 승인을 받지 못하면 해당 위험을 단계 기록에 남기고 최종 검증으로 미룬다. 최종 검증에서 회귀가 발견되면 단계별 커밋을 기준으로 원인 범위를 좁혀 표적 검증한다.

## 커밋 계획

| 순서 | 커밋                                                                   | 상태 | 비고                                                                        |
| ---- | ---------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------- |
| 1    | `refactor: FSD _app·_pages 레이어 도입`                                | ✅   | 라우팅 진입점 re-export 전환 포함                                           |
| 2    | `chore: 소비처 없는 자산 삭제`                                         | ✅   | 이동과 성격이 달라 분리 (삭제를 택한 경우)                                  |
| 3    | `refactor: 공용 코드를 shared 레이어로 이동`                           | ✅   | `43faea2`                                                                   |
| 4-5  | `refactor: 도메인 상태·타입을 entities로, 상품 카드를 features로 이동` | ✅   | `30f0dc3` (4번과 5번 합쳐짐)                                                |
| 6    | `refactor: 복합 UI를 widgets로 분리`                                   | ✅   | `Header` 슬라이스화, 기타 파일 위치 정리                                    |
| 7    | `refactor: 조회 계층을 페이지 슬라이스로 이동`                         | ✅   | query factory, hooks, HeroBanner 이동 완료, `947fdb6` (훅 파일명 camelCase) |
| 8    | `docs: 6주차 FSD 전환 판단과 이동 결과 기록`                           | ⏳   | RFC/결정사항 최종 정리 (이 단계)                                            |

각 논리적 변경 단위는 staging까지 하고 커밋은 작성자가 직접 실행한다.

## 되돌리기

- 문제가 생긴 단계 이후의 커밋이 해당 구조에 의존하는지 먼저 확인한다. 의존한다면 최신 커밋부터 역순으로 함께 `git revert`하고, 단일 커밋만 되돌릴 때도 별도 복구 브랜치에서 lint·typecheck를 확인한다.
- 이전 시도에서 2~5단계를 한 번에 완료한 결과물이 `git stash` 항목으로 남아 있다. 단계별 재작업 중 최종 결과를 대조할 참조로만 쓰고, 그대로 꺼내 쓰지 않는다.

---

_이 문서는 AI(Claude)가 작성한 프로세스 초안입니다. 각 단계의 "결정할 것" 표는 후보만 채워 두었고 결정은 비어 있습니다 — 실제 이동 전 0.5단계에서 작성자가 판단해 채우고, 해당 단계에서 다시 확인합니다. 이동 대상·주의 항목은 현재 코드의 import 관계를 대조해 정리한 것입니다._
