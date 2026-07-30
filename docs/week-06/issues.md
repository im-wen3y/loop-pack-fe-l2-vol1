# 6주차 전환 중 발견한 이슈

> 전환 단계를 밟는 도중에 발견한 것들을 기록만 해 둔다. 이동과 수정을 같은 커밋에 섞지 않기 위해, 고치는 것은 전체 이동이 끝난 뒤에 한 번에 한다.
>
> 상태: `기록` = 아직 손대지 않음 / `해결` = 처리 완료

## 4단계 검토에서 발견

### I-1. Route Handler 테스트를 한 번도 돌리지 않았다 · 위험

- 상태: 기록
- 3단계에서 `types/commerce.ts`를 분해하면서 `src/app/api/**`가 참조하는 타입 경로가 전부 바뀌었다. `src/app/api/_data/commerce.test.ts`, `home/route.test.ts`, `products/route.test.ts` 3개 파일(36 테스트)이 그 타입을 쓰는데, 전환 시작 후 `pnpm test`를 실행하지 않았다.
- `tsc --noEmit`이 통과하므로 타입은 맞지만, 런타임 동작은 확인되지 않았다.
- 처리: 최종 검증에서 `pnpm test` 36/36을 기준선과 대조한다. 그 전이라도 사용자 승인이 있으면 먼저 돌린다.

### I-2. `ProductCard.module.css`를 두 컴포넌트가 나눠 쓴다 · 사소

- 상태: 기록
- `features/product-card/ui/ProductCard.module.css`의 `.actions`를 `ProductCardActions.tsx`가 쓴다. 같은 슬라이스 안이라 경계 위반은 아니지만, 파일명이 `ProductCard`의 것처럼 보여 소유를 잘못 말한다.
- 선택지: 이름을 `productCard.module.css`처럼 슬라이스 단위로 바꾸거나, `.actions`만 `ProductCardActions.module.css`로 뗀다.

### I-3. entity Public API가 store 인스턴스를 그대로 연다 · 판단 필요

- 상태: 기록
- `entities/cart/index.ts`가 `useCartStore`를 그대로 내보낸다. 소비처가 selector를 직접 쓸 수 있어 편하지만, `useCartStore.getState()`·`setState()`로 store 전체를 조작하는 것도 막지 못한다. 5주차에 만든 `hydration-demo`가 실제로 `setState`를 그렇게 썼다.
- 계약을 "id 집합 + 토글"로 좁히려면 `useCartIds()`·`useToggleCart()` 같은 훅만 여는 방법이 있다. 다만 selector로 리렌더를 좁히는 현재 이점이 사라진다.
- 지금 당장 깨지는 것은 없어서 기록만 한다.

### I-4. 위시리스트 삭제 시나리오가 폴더 하나로 끝나지 않는다 · 설계 결과

- 상태: 기록 (4단계 결정의 알려진 대가)
- 삭제할 것: `entities/wishlist/`
- 수정할 것: `features/product-card/model/useProductCardActions.ts`, `ui/ProductCardActions.tsx`, `ui/ProductCard.module.css`, `Header`
- 찜과 담기를 한 훅에 모은 결과다. 슬라이스를 나누지 않고 훅만 갈라도 개선되므로, 5단계 자가 검증에서 이 답을 놓고 판단한다.

### I-5. Route Handler가 클라이언트 model을 import한다 · 6단계에서 재검토

- 상태: 기록
- `src/app/api/home/route.ts` → `@/service/home/model`, `products/route.ts` → `@/service/products/model`. "응답 봉투는 조회하는 쪽이 소유"라는 2단계 결정의 결과다.
- 6단계에서 `service/*`가 `_pages/*/api`로 내려가면 mock 백엔드가 페이지 슬라이스 내부를 가리키게 된다. 그때 Public API로 공개할지, 방향을 뒤집을지 정한다.

## 이전 단계에서 이월된 것

### I-6. 홈 에러 화면의 `다시 시도`가 동작하지 않는다 · 기존 버그

- 상태: 기록 (0단계에서 발견, RFC에 원인 분석 있음)
- `reset()`이 react-query `errorResetBoundary`를 초기화하지 않아 재요청이 일어나지 않는다.
- 수정 위치: `_app/ui/RootErrorFallback.tsx`. 구조 변경 완료 후 별도 `fix:` 커밋으로 처리한다.

### I-7. 전환 중에는 lint가 옛 폴더 의존을 잡지 못한다 · 도구 한계

- 상태: 기록
- `boundaries/include`에 `src/components`·`src/service`가 없어 "unknown"이 아니라 "ignored"로 처리된다. 전환이 끝나 옛 폴더가 사라지면 자연히 해소된다.
- 그때까지 각 단계에서 grep으로 따로 확인한다.

### I-8. 과제 4단계(에러 경계) 구현이 남았다 · 미착수

- 상태: 기록
- `throwOnError`로 경계 기준을 코드에 표현하는 부분. 한 번 구현했다가 마이그레이션 단계를 먼저 밟기로 하고 되돌렸다.
- 기준은 정해 뒀다 — **화면이 이 데이터에 얼마나 의존하는가**. 홈은 경계(전체가 그 데이터), 목록은 인라인(필터를 남겨야 조건을 바꿔 빠져나올 수 있다). 과제 예시(`5xx는 경계로`)를 따르지 않는 이유는 목록의 5xx를 경계로 올리면 필터가 사라지고, E2E 기준선 1건이 깨지며, I-6 버그가 목록으로 번지기 때문이다.
- 전체 이동이 끝난 뒤 착수한다.

---

_이 목록은 AI(Claude)가 각 단계 검토에서 코드와 import 관계를 대조해 정리한 것입니다. 무엇을 이슈로 볼지와 처리 시점은 작성자가 정합니다._
