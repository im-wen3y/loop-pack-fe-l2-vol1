# 4주차 Component Review 결과

> `/component-review` 스킬로 `src/` 전체를 대상 실행. 5개 관점(관심사 분리·Custom Hook 책임·API 레이어·분리 근거/프로세스·Server/Client 경계)을 병렬 점검. 총 2회 실행 — 1차(아래 "1차 리뷰")는 발견 15건 전부 반영 완료, 2차("2차 리뷰")는 `/demo/*` 라우트 삭제 이후 재점검한 결과.

## 1차 리뷰

### 🟠 Major

- `[fixed]` 데모 페이지 2곳의 문서화 섹션 컴포넌트(`DialogDocSection`/`SelectDocSection`)가 타입·JSX 구조가 완전히 동일한데 각각 새로 작성됨. 공유하지 않은 이유가 코드 주석·문서 어디에도 없음. (관심사 분리 / 분리 근거·프로세스)
  → 공용 `DocSection` 컴포넌트로 통합(이후 `/demo/*` 라우트 자체가 삭제되며 이 컴포넌트도 함께 제거됨 — 2차 리뷰 참고). `.example`만 페이지별로 달라서(`dialog`는 flex 레이아웃 추가) `exampleClassName` prop으로 흡수.
- `[fixed]` `fetchApi`가 `res.ok` 체크 없이 `res.json()`을 반환하고, `error.tsx`가 하나도 없음. (API 레이어)
  → `fetchApi`에 `res.ok` 체크·throw 추가, fetch가 있는 라우트에 `error.tsx`·`loading.tsx` 신설.
- `[fixed]` `Product` 타입이 route의 mock 구조를 손으로 재선언, 단일 진실 소스 없음. (API 레이어)
  → `src/app/api/products/_types.ts`에 `Product` export, route와 페이지가 같은 타입 참조(`code-style.md`의 `_types` 컨벤션을 이 저장소에서 처음 실제 적용).

### 🟡 Minor

- `[fixed]` `src/components/ui/select/TextOptionSelect.tsx:48,79` 등 3파일 6곳 — `option.stock === 0` 하드코딩 반복. (Custom Hook)
  → `src/utils/isSoldOut.ts` 추출, 3개 컴포넌트가 참조.
- `[fixed]` `src/components/ui/select/SizeOptionSelect.tsx:70-81` 등 3파일 — toggle 아이콘 `<Image>` 마크업 반복, "마크업 완전 독립" 근거와 배치. (분리 근거/프로세스)
  → `src/components/ui/select/SelectToggleIcon.tsx`로 통합, 3개 CSS 모듈의 `.toggleIcon`/`.toggleIconOpen` 삭제.
- `[fixed]` 데모 페이지 전체가 `'use client'`. (Server/Client 경계)
  → `'use client'` 제거, 실제 상태가 필요한 조각만 `ControlledDialogDemo.tsx`·`UncontrolledDialogDemo.tsx`로 분리. (uncontrolled 쪽은 상태가 없었지만, `Dialog.Trigger` 등 `Object.assign` 서브 프로퍼티가 Server→Client "client reference" 경계를 못 넘는 걸 빌드 에러로 확인해서 같이 leaf로 분리함 — 자세한 내용은 아래 참고.)
- `[fixed]` `src/hooks/useSelect.ts:106-110` — `onClear`가 `selectIndex`와 달리 `undefined` 가드 없음. (Custom Hook)
  → `selected === undefined`면 조기 반환하도록 가드 추가.
- `[fixed]` `src/hooks/useSelect.ts:16` — 훅 이름이 키보드/바깥클릭 책임까지는 설명 못함. (Custom Hook)
  → 리네이밍 대신(3개 소비처 리스크 대비 이득 작음) 상단 주석에 책임 범위와 근거를 명시.
- `[fixed]` `src/app/api/products/route.ts:67` — `totalCount` 미사용. (API 레이어)
  → 응답에서 제거.
- `[fixed]` `getProducts`/`getSizes`/`getPurchaseOptions` 반복 패턴. (API 레이어)
  → 코드 변경은 안 함(제네릭화하면 리소스별 키 타이핑이 억지스러워짐) — 이유를 코드 주석으로 남김.

### 💡 Suggestions

- `[no_change_needed]` `src/hooks/useSelect.ts:67-75` — `useOutsideClick` 분리 검토.
  → 실제 두 번째 후보인 Dialog는 `Dialog.Overlay`로 이미 바깥 클릭을 해결하고 있어 분리 대상이 아님. `src/hooks/README.md`에 근거 문서화.
- `[fixed]` `src/components/ui/dialog/index.tsx` — Dialog가 custom hook 대신 Context를 쓰는 이유 미문서화.
  → `DialogContext` 근처에 근거 주석 추가(Select와 Dialog가 푸는 문제가 다르다는 요지), `src/hooks/README.md`로 상세 설명 연결.
- `[fixed]` `src/app/api/products/route.ts` 등 — 응답 봉투(envelope) 규칙 미문서화.
  → `src/app/api/README.md` 신설, 봉투 규칙 + `_types.ts` 컨벤션 기록.
- `[fixed]` `loading.tsx` 없음.
  → 위 API 에러 처리 항목과 함께 추가.
- `[fixed]` `src/app/page.tsx:3-24` — 인라인 style 사용.
  → `src/app/page.module.css`로 전환.

### 1차 구현 중 발견한 이슈

계획엔 없었지만 구현하다 드러난 것 — Dialog 데모 페이지를 Server Component로 바꾸면서 uncontrolled
섹션(`<Dialog><Dialog.Trigger>...`)도 그대로 직접 렌더하면 될 줄 알았으나, 빌드에서
`Element type is invalid... got undefined` 에러가 났다. `Dialog.Trigger`/`.Overlay`/`.Content`는
`Object.assign`으로 런타임에 붙인 프로퍼티라, Server Component가 `'use client'` 모듈을 "client
reference"로 받을 때는 최상위 export만 참조로 변환되고 이런 서브 프로퍼티는 따라오지 않는다. 그래서
상태가 없는 uncontrolled 데모도 `UncontrolledDialogDemo.tsx`(`'use client'`)로 분리해서, 컴파운드
서브 프로퍼티에 대한 JSX 접근이 client 모듈 그래프 안에서만 일어나도록 했다. (이 컴포넌트는 이후
`/demo/*` 라우트 삭제 때 `src/app/_components/`로 옮겨졌다 — 2차 리뷰 참고.)

## 2차 리뷰

`/demo/select`, `/demo/dialog` 라우트를 삭제하고 랜딩 페이지(`/`) 탭으로 통합한 뒤 재점검. 1차에서
고친 항목들은 전부 코드에 정확히 반영돼 있었으나(`grep -rn "eslint-disable\|@ts-ignore\|: any\b\| as any" src/` 매치 없음 포함), 그 이후 작업에서 새로 생긴 문제와, 문서·주석이 삭제된 파일을 계속
가리키고 있는 "stale 참조" 문제가 여러 건 발견됐다.

### 🟠 Major

- `src/services/catalog.ts:11,25` — "소비처가 demo/select 페이지와 랜딩 페이지 프리뷰 2곳"이라는 근거 주석이 남아 있는데, `/demo/select` 라우트가 삭제되어 지금은 `SelectPreview.tsx` 한 곳뿐이다. 분리 근거가 사실과 달라 이 파일을 계속 별도로 둬도 되는지 판단하려는 사람을 오도한다. (관심사 분리 / API 레이어 / 분리 근거·프로세스 — 3개 관점에서 공통 지적)
- `src/app/api/sizes/route.ts`, `src/app/api/purchase-options/route.ts` — `src/app/api/README.md`가 못박은 컨벤션("route 응답 아이템 타입은 같은 폴더 `_types.ts`에 정의")을 `products`만 지키고 이 두 route는 안 지킨다. mock 배열이 타입 없는 리터럴이라, `catalog.ts`가 `SizeSelectOption`/`TextSelectOption`으로 가져다 쓸 때 route 응답 구조가 실제로 그 타입과 맞는지 컴파일러가 검증하지 못한다. (API 레이어)
- `src/app/error.tsx` — `SelectPreview` 하나의 fetch 실패만 원인인데 라우트 루트 `error.tsx`로 처리해서, 실패 시 관련 없는 `DialogPreview`(Dialog 탭)까지 포함한 페이지 전체가 에러 화면으로 대체된다. `page.tsx`가 이미 `<Suspense><SelectPreview /></Suspense>`로 좁게 감싸놨는데 그 스코프에 맞는 로컬 에러 바운더리가 없다 — `component-design.md`의 "라우트보다 좁은 범위엔 Suspense/ErrorBoundary 직접 사용" 원칙과 반대 방향. (API 레이어 / Server·Client 경계 — 2개 관점에서 독립적으로 동일하게 지적)
- `src/app/_components/ControlledDialogDemo.module.css:1-9`, `UncontrolledDialogDemo.module.css:1-9` — `.trigger` 규칙(padding/border/radius/background/font-size/font-weight/cursor)이 두 파일에 글자 그대로 중복. 두 컴포넌트가 "왜 각자 leaf Client Component로 분리됐는지"는 주석에 있지만 "왜 CSS까지 각자 복제했는지"는 근거가 없다. 같은 세션에서 `SelectToggleIcon`으로 반복 마크업을 통합한 것과 상반된 처리. (분리 근거/프로세스)
- `src/services/catalog.ts:36-46` — 네트워크 호출이 없는 순수 매핑 함수 `toThumbnailOptions`(`Product[] → ThumbnailSelectOption[]`)가 API 호출 계층(`services/catalog.ts`)에 같이 있다. `fetchApi`/`getProducts` 등 "요청" 책임과 "형태 변환" 책임이 한 파일에 섞여 있어, `code-style.md`의 재사용 원칙과 별개로 "순수 함수는 utils로" 원칙에 어긋난다. (관심사 분리)
- `docs/week-04/component-review-result.md`(이 문서 1차 리뷰 항목) — 이미 삭제된 `src/app/demo/_components/DocSection.tsx` 경로를 그대로 참조하고 있었다(이번 갱신으로 수정). (분리 근거/프로세스)

### 🟡 Minor

- `src/hooks/useSelect.ts:112-127,153-166` — 훅이 반환하는 `open`/`close`/`toggle` 중 `open`/`close`는 현재 3개 소비 컴포넌트 어디에서도 구조분해해 쓰지 않는다(`onTriggerClick` 내부에서 `toggle`만 씀). 실제 쓰이지 않는 반환값이 있어 훅의 공개 API 표면이 필요보다 넓다. (Custom Hook)
- `/demo/*` 라우트를 삭제하고 랜딩 탭으로 합친 상위 아키텍처 결정 자체("왜 별도 데모 라우트 대신 탭으로 합쳤는가")가 `page.tsx`/`HomeTabs.tsx` 어디에도 코드 주석으로 남아있지 않다. (분리 근거/프로세스)

### 💡 Suggestions

- `src/hooks/useSelect.ts:37` — `selectedIndex`가 `options.findIndex((option) => option === selected)`로 참조 동일성 비교를 한다. 현재 소비처는 모두 `options`를 안정적인 참조로 넘기고 있어 문제없지만, 이 전제가 `UseSelectParams` 타입에 문서화돼 있지 않다.
- `src/services/catalog.ts:17` — `cache: 'no-store'`가 3곳에 하드코딩. mock이라 지금은 무해하지만, 캐싱 전략이 필요해지면 이 한 줄이 유일한 튜닝 지점이라는 걸 참고.

### 재검토 판정

| 관점               | 1차 (수정 후) | 2차 |
| ------------------ | ------------- | --- |
| 관심사 분리        | ✅            | ❌  |
| Custom Hook        | ✅            | ✅  |
| API 레이어         | ✅            | ❌  |
| 분리 근거/프로세스 | ✅            | ❌  |
| Server/Client 경계 | ✅            | ❌  |

`/demo/*` 삭제 이후 작업에서 stale 주석(소비처 수 불일치)과 에러 바운더리 스코프 문제가 여러 관점에
걸쳐 반복적으로 지적됐다 — 특히 `src/services/catalog.ts`의 "소비처 2곳" 주석과 `src/app/error.tsx`의
스코프 문제는 각각 3개, 2개 관점에서 독립적으로 잡혀 신뢰도가 높다. 아직 수정은 하지 않았고, 이
문서는 발견 사항만 기록한다.

## 검증

`pnpm lint`/`pnpm build`/`pnpm test:e2e`(28건) 모두 통과(2차 리뷰는 코드 변경 없이 읽기 전용으로
진행돼 별도 재검증 불필요).

## AI 작성 표기

이 문서는 AI(Claude)가 `/component-review` 스킬로 `src/` 전체를 5개 관점에서 병렬 서브에이전트
리뷰를 실행하고, 각 결과를 종합·중복 제거해 작성했습니다. 발견 사항의 등급 분류와 관점별 통과
여부 판정은 AI가 판단했고, 사용자가 검토합니다.

1차 리뷰의 수정 방향은 AI가 plan 모드로 설계했고(범위는 "Suggestions까지 전부"로 사용자가 지정),
구현·검증도 AI가 직접 수행했습니다. 구현 중 발견한 회귀(Dialog compound 컴포넌트의 client reference
제약)도 AI가 빌드 에러로 발견하고 원인을 분석해 수정했습니다. 2차 리뷰는 사용자 요청으로 AI가
읽기 전용으로 재실행했고, 아직 수정은 하지 않았습니다. 최종 코드는 사용자가 검토합니다.
