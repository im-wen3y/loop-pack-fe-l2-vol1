# RFC Week 06 남은 작업 체크리스트

[`docs/rfc/week06-fsd.md`](../rfc/week06-fsd.md)에서 아직 비어 있거나 실제 코드와 어긋난 칸을 모아둔 목록.

- 과제 요구 항목 충족 여부는 [`docs/week-06/checklist.md`](./checklist.md)에서 따로 관리한다. 이 문서는 **RFC 본문의 빈칸과 stale**만 다룬다.
- 줄 번호는 2026-07-31 기준. RFC를 편집하면 어긋날 수 있으니 제목으로 찾는 편이 안전하다.

---

## A. 필수 — 과제 산출물

### A-1. 구조 변경 후 자동 검증 (`## 0. 동작 기준선` → `### 자동 검증 결과`)

이미 실행해 결과가 적힌 것과 아직 안 돌린 것을 구분한다.

**기록 완료 — 최종 실행에서 동일한지 재확인만 하면 되는 항목**

- [x] `pnpm lint` — ✅ 통과 (8단계 기준, `eslint-disable` 0건)
- [x] `pnpm typecheck` — ✅ 통과
- [x] `pnpm test` — ✅ **36/36**, Test Files 3/3 (기준선 일치)
  - ⚠️ 8단계에서 `vitest.config.ts`의 `include` 누락으로 **0개**가 잡히던 걸 발견해 고쳤다. 다음 실행 때도 **수집 파일 수 3개**를 함께 확인할 것

**미실행 — 실행하고 결과를 RFC 표에 입력해야 하는 항목**

- [ ] `pnpm build` — 기대: **라우트 5개**(`hydration-demo` 삭제 반영). 동적/정적 구분이 구조 변경 전과 같은지 확인
- [ ] `pnpm test:e2e` — 기대: Chromium·WebKit 40/40
  - WebKit `debounce 대기 중 페이지를 떠나면…` 플레이키 1건 이력 있음. 실패하면 단독 `--repeat-each=3`으로 3/3인지 확인 후 판정
- [ ] `pnpm check` 전체 통과 여부를 표 첫 행에 입력

> `pnpm check`는 `pnpm test && pnpm lint && pnpm typecheck && pnpm build`다. 개별 항목을 다 돌렸다면 마지막에 한 번만 확인하면 된다.

### A-2. 수동 검증 M1~M9 (`### 수동 검증 결과`)

관찰값(화면 문구·`총 N개`·URL 쿼리스트링·헤더 숫자)이 **문자열까지** 일치할 때만 체크. 어긋나면 체크하지 말고 실제 관찰값을 판정 열에 적는다.

- [ ] **M1** 홈 로딩 — Network Slow 3G + `/` 하드 리로드 → `홈을 불러오는 중…` 후 본문 교체
- [ ] **M2** 홈 에러 → `문제가 발생했어요` + `다시 시도`
- [ ] **M3** 홈 빈 상태 → 배너·카테고리 유지, 인기/신상품 섹션 미노출
- [ ] **M4** 홈 정상 — `/` → 배너 `매일 새롭게 발견하는 취향`, 카테고리 5개, 인기·신상품 6개씩
- [ ] **M5** 목록 로딩·정상 — `/products` 첫 진입 → 스켈레톤 → `총 30개`, `1 / 3`
- [ ] **M6** 조건 전환 중 목록 유지 — 카테고리 변경 → 이전 목록 유지·흐려짐(`aria-busy`) → 교체
- [ ] **M7** URL 공유 — `/products?q=스탠리&category=home&sort=price-desc` 새 탭 → `총 4개` + 값 복원
- [ ] **M8** 페이지 이동 중 상태 유지 — 홈에서 찜·담기 → 목록 → 홈 복귀 → 헤더 숫자 유지, `aria-pressed=true`
- [ ] **M9** 목록 에러와 복구 — `/products?page=0` → `다시 시도` → `page=1` → 에러 노출·재시도 실패·조건 수정 시 복구

> **M2·M3 재현 경로 주의**
> RFC 본문(0단계 각주)은 `service/home/api.ts`에 `?scenario=error`를 임시 추가하라고 적혀 있으나 **그 파일은 존재하지 않는다.** 6단계에서 `shared/api/home`으로, 8단계에서 다시 옮겨 현재 위치는 [`src/_pages/home/api/api.ts`](../../src/_pages/home/api/api.ts)다. 재현 후 반드시 원복하고 **커밋하지 않는다.**

### A-3. 홈 에러 재시도 버그 수정 (`### 리팩토링 중 발견한 기존 버그`)

RFC에 원인까지 규명해두고 "구조 변경 완료 후 별도 `fix:` 커밋"으로 미뤄둔 항목. **표의 `검증 결과` 칸이 아직 `_(구조 변경 후 확인)_`이다.**

**순서를 지켜야 한다. M2 기준선이 오염된다.**

- [ ] 1. A-2의 **M2를 먼저 수행**해 에러 UI 노출까지의 기준선을 확정하고 RFC에 기록
- [ ] 2. Network 탭을 열고 `다시 시도` 클릭 → `/api/home` 요청 **0건**이면 원인 확정
- [ ] 3. [`src/_app/ui/RootErrorFallback.tsx`](../../src/_app/ui/RootErrorFallback.tsx)에서 두 reset을 함께 호출

  ```tsx
  const { reset: resetQueryError } = useQueryErrorResetBoundary()
  // ...
  onClick={() => {
    resetQueryError()
    reset()
  }}
  ```

- [ ] 4. 재확인 후 RFC 버그 표의 `검증 결과` 칸 입력
- [ ] 5. 구조 변경 커밋과 **분리**해 `fix:` 커밋으로 처리

### A-4. 애매한 파일 결정 2건 — ✅ 완료 (8단계)

- [x] **상품 목록 queryOptions** → **A** `entities/product/api`
  - 6단계에 `shared/api/product`로 갔다가 8단계에서 되돌렸다
  - 기준을 _"여러 페이지에서 재사용되는가"_ → _"이 코드가 도메인을 아는가"_ 로 바꿔 적었다
- [x] **홈 queryOptions** → **B** `_pages/home/api` (행 신설)
- [x] **`searchParams.ts`** → **쪼갬**
  - 조회 계약(parser·허용값·직렬화)은 `entities/product/api/query-schema`
  - 화면 동작(히스토리·라벨·`PRODUCT_PAGE_SIZE`)은 `_pages/product-list/model`
  - 후보 A·B 중 하나가 아니라 한 파일에 두 소유자가 있었다는 결론

> 판단 흐름은 [decisions.md](./decisions.md) 9번에 정리했다.

### A-5. 5단계 삭제 시나리오 (`## 5단계 — 삭제 시나리오 자가 검증`)

세 항목 모두 비어 있다. **실제로 삭제하지 말고 종이 위에서만** 추적한다.

- [ ] **위시리스트 제거 시 — 삭제할 폴더·파일**
- [ ] **위시리스트 제거 시 — 수정이 필요한 파일**
- [ ] **응집 판정** — grep 없이 다 찾을 수 있었는가 / 못 찾은 것이 있다면 무엇인가
- [ ] **신상품 뱃지 추가 시 — 터치할 파일**
- [ ] **신상품 뱃지 추가 시 — 판정**
- [ ] **발견한 파편화 표** — 파편화 내용 / 이번 주에 고칠 것·남길 것 / 근거

> 비기능 요구사항의 _"손댈 파일을 grep 없이 예측할 수 있어야 한다"_ 가 여기서 판정된다. 예측을 **먼저 적고** 그다음 실제로 찾아 대조해야 의미가 있다.

### A-6. FSD 이해 확인 질문 6개 (`## FSD 이해 확인 질문`)

과제 필수 산출물이다. 각 2~4문장.

- [ ] **Q1** `ProductCard`가 찜 버튼을 직접 import하면 어떤 의존 규칙을 어기며, 어디에서 조합해야 하는가
- [ ] **Q2** 한 페이지에서만 쓰는 검색 로직도 반드시 feature여야 하는가 / 내 프로젝트에서는 어떻게 결정했는가
- [ ] **Q3** `formatPrice`는 항상 `shared/lib`인가 / 통화·회원 등급·상품 정책이 포함되면 결정이 어떻게 달라지는가
- [ ] **Q4** 두 feature가 협력해야 할 때 직접 import하지 않고 어떤 상위 레이어에서 조합했는가
- [ ] **Q5** 폴더 이동 후에도 TanStack Query 데이터와 Zustand 데이터를 서로 복사하지 않은 이유
- [ ] **Q6** barrel file과 Public API의 차이 / 어느 쪽을 선택했고 의도는 무엇인가

> Q2·Q6은 이번 주 실제 결정(`usePagination` 분리, 슬라이스별 명시적 `index.ts`)과 직접 이어진다. RFC 본문·[`decisions.md`](./decisions.md)에 이미 쓴 근거를 재사용할 수 있다.

---

## B. 문서·코드 동기화 — ✅ 완료 (8단계)

RFC 본문을 실제 코드에 맞춰 고쳤다. 아래는 무엇을 고쳤는지의 기록이다.

### B-1. 파일 매핑표의 stale 경로 — ✅

- [x] `HomeResponse` → `_pages/home/api/model.ts` (`GetHomeResponse`)
- [x] `ProductListResponse`·`ProductListQuery` → `entities/product/api/model.ts`
- [x] `MockApiScenario`·`ApiErrorResponse` → `app/api/_types.ts` (root 이동 반영)
- [x] `usePagination` **(임시)** 해제 → `shared/lib` + `_pages/.../useProductPagination`
- [x] `useProductFilters` **(임시)** 해제 → `_pages/product-list/model`

### B-2. 결정이 끝났는데 "미정"으로 남은 문장 — ✅

- [x] `## O — Optimization`의 Public API 번들 영향 → "결정은 끝났고 측정은 안 했다 + 이유"로 교체
- [x] 문서 최상단 `채움 규칙` → 남은 빈칸이 **런타임 검증 결과와 자가 검증 답변**임을 밝히고 이 체크리스트를 링크
- [x] `Dialog 열림 여부` 행 삭제 (`dialog`는 2단계에서 삭제돼 소비처가 없다)
- [x] `shared/api/home/index.server.ts` 예시 → 실재하지 않는 경로라 현재 상황으로 교체

### B-3. 기능 요구사항 표의 경로 — ✅

- [x] 열 이름을 `현재 구현 위치` → **`5주차 구현 위치`** 로 변경하고, 구조 변경 후 자리는 매핑표·After 트리에서 본다는 안내를 덧붙였다 (Before 스냅숏으로 의도한 표가 맞았다)

### B-4. 추가로 발견해 고친 것 — ✅

- [x] **After 폴더 트리에 실재하지 않는 파일 2개** — `entities/index.ts`, `shared/index.ts`. 슬라이스가 없는 레이어에는 Public API를 두지 않기로 한 결정([decisions.md](./decisions.md) 2번 곁가지)과도 어긋나 있었다
- [x] `shared/lib/use-debounced-callback.ts` → 실제는 `useDebouncedCallback.ts` (훅 camelCase 규칙, 7번 결정)
- [x] 허용/금지 import 예시의 `shared → _pages` 예외 문구 → 8단계에서 예외 0건이 되어 삭제
- [x] 상태 분류표·슬라이스별 공개/비공개 표를 8단계 배치로 갱신
- [x] 마이그레이션 단계 표에 **8단계** 추가
- [x] 자동 검증 결과 표에 `pnpm test` 36/36 기록 + vitest include 사고 경위 주석

### B-5. week-06 문서 간 상호 참조

- [x] RFC → [`decisions.md`](./decisions.md) **4번** 링크 유효 확인
- [ ] [`entity-decisions.md`](./entity-decisions.md), [`fsd-migration-process.md`](./fsd-migration-process.md), [`issues.md`](./issues.md)가 아직 untracked → 커밋 대상인지 판단
- [ ] 세 문서와 RFC의 결정 내용 대조 (특히 `usePagination` 분리, ProductCard의 widget 이동, 8단계 조회 계층 재배치)

---

## C. 선택 — 여유가 있을 때

### C-1. 4단계 실패 재현 결과 (`### 실패 재현 결과`)

RFC 원본은 **헤더만 있는 빈 표**다. 아래는 채울 후보에 대한 제안일 뿐, RFC에 이미 적힌 내용이 아니다.

- [ ] 진행 여부 결정
- [ ] 진행 시 재현 대상 (제안)
  - 상품 목록 조회 실패 → `/api/products`를 DevTools에서 차단하거나 `?scenario=error`
  - 홈 조회 실패 → A-3의 M2와 동일 조건이라 **결과를 재사용할 수 있다**
  - 장바구니 행위 오류 → 현재 로컬 토글뿐이라 실패 경로 없음(에러 처리 표에 이미 `해당 없음`으로 기재)
- [ ] 임시 `throw`를 넣었다면 **제거 여부를 표 아래에 명시**

### C-2. Advanced (`## Advanced (선택)`)

- [ ] **A. 의존성 하네스** 진행 여부 — Yes / No
  - No라면 `선택 여부:` 칸에 **"하지 않음 + 이유"**를 적어 빈칸을 없앤다
- [ ] **B. 변경 반경 실험** 진행 여부 — Yes / No
  - 위와 같음. 표는 미진행 시 삭제하지 말고 `N/A` 처리

### C-3. AI 리뷰 기록 (`## AI 리뷰 기록`)

- [ ] 반려한 지적이 있으면 근거와 함께 기록. 없으면 "해당 없음" 한 줄

---

## 권장 순서

1. ~~**B (문서 동기화)**~~ — ✅ 8단계에서 완료. A-4도 함께 정해졌다
2. **A-1 나머지, A-2** — `pnpm build`·`pnpm test:e2e` → 수동 M1~M9로 기준선 확정
3. **A-3** — M2 기준선이 확정된 **다음에** 버그 수정, 별도 `fix:` 커밋
4. **A-5, A-6** — 문서 작성. 코드 실행 불필요
5. **C** — 기한에 여유가 있을 때만

> 소요 시간은 적지 않는다. 항목별 편차가 크고, 근거 없는 추정은 순서 판단에 도움이 되지 않는다.

---

> 이 문서는 AI(Claude)가 [`docs/rfc/week06-fsd.md`](../rfc/week06-fsd.md) 본문과 실제 파일 구조를 대조해 **빈칸과 불일치를 수집한 목록**입니다. 각 항목을 어떻게 채울지, B-3처럼 판단이 갈리는 항목을 어느 쪽으로 정할지는 작성자가 결정합니다.
>
> AI가 대조로 확인한 사실: 파일 매핑표 3건의 경로 불일치(B-1), `(임시)` 표기 2건, 삭제된 경로 참조(B-3), `decisions.md` 4번 항목의 존재 여부, `package.json`의 `check` 스크립트 구성.
