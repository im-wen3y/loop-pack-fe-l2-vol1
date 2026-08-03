# 7주차 진행 순서

7주차는 코드 개선 과제가 아니라 측정 과제다. 합격선(점수·향상률)이 없고, 완료조건이 전부 "Before/After SHA, 5회 raw 값·중앙값·범위, 어떤 구간이 길었고 왜 그 변경을 골랐는지"를 제출물에서 확인할 수 있느냐다.

따라서 **최적화 코드를 먼저 건드리면 안 된다.** Before를 남길 수 없게 된다.

## 시작 시점의 레포 상태

과제 명세와 대조한 결과다.

### 이미 갖춰진 것

- slow scenario — `app/api/home/route.ts`, `app/api/products/route.ts` 둘 다 `?scenario=slow`(1.5초) 지원
- 2단계 재료 상당수 — `placeholderData: keepPreviousData`, `ProductGridSkeleton`, 0건·에러·재시도 UI, nuqs 기반 URL 상태, 서버 응답을 Zustand에 복사하지 않음
- `getServerQueryClient`가 `cache()`로 요청 단위 분리 — 3단계 요구사항과 이미 일치
- Advanced A 측정 화면 — `app/performance-lab/inp/page.tsx`(24개 카드)

### 아직 없는 것

- ~~`HeroSection`이 홈에 연결되지 않음~~ → Step 1에서 완료
- `generateMetadata`가 한 곳도 없음 — `app/layout.tsx`의 정적 `metadata`만 존재
- `APP_ORIGIN` 없음 — 현재는 `src/shared/api/get-api-base-url.ts`의 `NEXT_PUBLIC_BASE_URL`

### 경로 매핑

과제 문서의 경로는 starter 기준이라 이 레포와 다르다. 누적 구조를 유지하고 경로만 대응시킨다.

| 과제 문서                              | 이 레포                 |
| -------------------------------------- | ----------------------- |
| `src/app/layout.tsx`                   | `app/layout.tsx`        |
| `src/app/(commerce)/page.tsx`          | `app/(home)/page.tsx`   |
| `src/app/(commerce)/products/page.tsx` | `app/products/page.tsx` |

## 진행 순서

### Step 1. Hero 연결 (코드) — 완료

`HeroSection`을 홈에 연결했다. **7.5MB·3840×2160 원본을 그대로 뒀다.** 0단계의 유일한 코드 작업이다.

- 기존 `HeroBanner`를 **대체**했다(병행 아님). starter 파일을 `src/examples/week-07-performance/`에서 `src/_pages/home/ui/`로 옮기고 `.module.css`, `.test.tsx`도 함께 이동했다.
- `HeroBannerSkeleton` → `HeroSectionSkeleton`. 실제 Hero와 같은 `.hero`·`.copy` 박스를 재사용해 `aspect-ratio 16/9`(모바일 `4/5`)를 공유한다. 교체 시 layout shift가 없어야 한다 — Step 3 녹화에서 확인할 것.
- starter의 `<h2>`를 `<h1>`으로 바꿨다. `HeroBanner`가 홈의 유일한 h1이었고, 3단계 "하나의 명확한 `h1`" 요구사항과도 맞다.
- 타입 참조를 `@app/api/_types`(mock 백엔드)에서 슬라이스 소유인 `@/_pages/home/api/model`로 바꿨다. FSD 의존 방향 유지.
- 최적화(포맷 변환·리사이즈·`next/image`·priority)는 여기서 하지 않았다. Step 4에서 측정 근거를 확보한 뒤에 한다.
- 남은 관찰거리: API의 `banner.image`(`/images/products/p6.jpg`)를 Hero가 더 이상 쓰지 않는다. Route Handler는 과제 지침대로 건드리지 않았다.

### Step 2. `APP_ORIGIN` 도입 (코드)

측정 조건을 고정해야 하므로 Before 측정 **전에** 끝낸다.

- `get-api-base-url.ts`의 `NEXT_PUBLIC_BASE_URL` 폴백을 `APP_ORIGIN` 기준으로 정리
- build와 runtime에 같은 값을 넣는다
- 3단계의 metadata query failure 재현(`APP_ORIGIN=http://127.0.0.1:9`)이 이 정리에 의존한다

### Step 3. Before 측정 (측정 · 코드 변경 없음)

```bash
pnpm build
pnpm start
```

확장 프로그램·캐시·로그인이 섞이지 않은 별도 브라우저 프로필에서 측정한다.

- 홈 cold load Lighthouse 5회 → FCP·LCP·CLS raw 값
- LCP element 확인
- Performance filmstrip에서 Header·`h1`·Hero 표시 순서
- Network waterfall에서 document·홈 데이터·Hero 이미지의 요청 시작 순서와 전송 크기
- `/api/products?scenario=slow`로 (a) 데이터 없는 최초 진입, (b) 기존 목록이 있는 갱신을 각각 녹화
- 검색·카테고리·정렬·페이지를 빠르게 연속 변경 → active query와 화면 일치 여부, 늦게 끝난 이전 요청이 화면을 덮는지, 취소된 요청은 어떻게 보이는지
- **Before commit SHA 기록**

여기까지 남기기 전에는 최적화 코드를 한 줄도 건드리지 않는다.

### Step 4. 1단계 — Hero LCP

LCP를 네 구간으로 쪼개 관찰한 뒤, 가장 긴 구간에만 개입한다.

1. 서버 응답 대기
2. 이미지 요청 시작 대기
3. 이미지 전송
4. 화면에 그려질 때까지

- 실제 표시 크기·viewport에 맞는 후보·포맷·압축률 선택
- Hero의 시각적 크기·비율·피사체·문구 유지 (작게 보이게 하거나 품질을 낮춰 수치만 줄이면 안 됨)
- 홈 데이터를 기다리는 동안 Header·`h1`·페이지 설명이 함께 막히지 않도록 렌더링 경계 조정
- Hero fallback이 실제 Hero와 같은 공간을 차지하는지 Layout shifts track으로 확인

### Step 5. 2단계 — 목록 6상태와 CLS

여섯 화면(최초진입 / 갱신중 / 성공+0건 / 최초실패 / 갱신실패 / 취소)이 녹화에서 구분되는지 먼저 확인한다.

**이미 만족하는 항목은 코드를 추가하지 않고 개입하지 않은 근거를 남긴다.** 과제가 명시적으로 허용한다.

- Step 3 녹화와 대조해 실제로 부족한 상태만 고른다
- `isPending`과 `isFetching`이 각각 어떤 화면을 맡는지 설명
- 취소된 요청이 오류로 보이지 않는지 별도로 관찰

### Step 6. 3단계 — metadata와 Open Graph

이번 주 신규 작업량의 대부분이다.

- 루트 title template·공통 Open Graph 정의
- 홈·상품 목록에 `generateMetadata` 추가, 본문 prefetch와 **같은 query factory** 사용
- shallow merge로 `siteName`·`locale`·`type`이 날아가지 않게 처리
- title·description 규칙: 검색어 → title 우선, category·sort → description, 2페이지 이상 → title에 페이지 번호
- 정상 empty는 0건을 설명하고 OG fallback image 유지 / query failure는 root 공통 metadata 상속
- `robots: noindex` 넣지 않기
- 서버 호출 계수는 임시 서버 로그로 세고 **관찰 후 계측 제거**
- 일반 UA vs `facebookexternalhit` 응답 시점 비교
- 초기 HTML 확인 (View Source 또는 JS 비활성 요청)

### Step 7. 4단계 — After와 회귀

Step 3과 **완전히 같은 조건**에서 재측정한다.

- URL, 행동, viewport, throttling, 브라우저·Lighthouse 버전, cold/warm, 브라우저 프로필 동일
- **After commit SHA 기록**
- LCP element, Hero 전송 크기, 요청 시작 순서, 가장 길었던 구간의 변화 비교
- 회귀 확인: 뒤로/앞으로 가기, 장바구니·위시리스트·Header 개수, 로딩·에러·빈 상태·재시도
- FSD 의존 방향과 Public API 우회 여부 확인
- 효과가 없거나 악화된 변경은 되돌리거나 유지 이유 기록
- `pnpm test`, `pnpm check` 통과 확인

### Step 8. Advanced A (선택)

Basic 완료 후, 실제 클릭에서 관계없는 카드 렌더 병목이 확인될 때만 진행한다.

- `/performance-lab/inp?pageSize=24`, 이미지 로드 완료 후 같은 상품 찜 버튼 1회 클릭
- production build + CPU 4x slowdown, Before/After 각 3회
- Interactions track: input delay / processing duration / presentation delay
- profiling build에서 React Profiler로 렌더 범위와 변경 원인 확인
- 금지: `pageSize` 축소, 필수 계산 제거, `setTimeout`으로 갱신 지연

## 측정 기록 틀

Step 3과 Step 7에서 같은 표를 채운다.

### 측정 조건

| 항목               | 값  |
| ------------------ | --- |
| Before SHA         |     |
| After SHA          |     |
| URL / query string |     |
| 행동               |     |
| viewport           |     |
| CPU throttling     |     |
| Network throttling |     |
| 브라우저 / 버전    |     |
| Lighthouse 버전    |     |
| cold load / warm   |     |
| 브라우저 프로필    |     |

### Lighthouse 5회

| 지표 | 1   | 2   | 3   | 4   | 5   | 중앙값 | 최솟값 | 최댓값 |
| ---- | --- | --- | --- | --- | --- | ------ | ------ | ------ |
| FCP  |     |     |     |     |     |        |        |        |
| LCP  |     |     |     |     |     |        |        |        |
| CLS  |     |     |     |     |     |        |        |        |

### LCP 구간 분해

| 구간             | Before | After | 비고 |
| ---------------- | ------ | ----- | ---- |
| 서버 응답 대기   |        |       |      |
| 이미지 요청 시작 |        |       |      |
| 이미지 전송      |        |       |      |
| 페인트까지       |        |       |      |
| Hero 전송 크기   |        |       |      |
| LCP element      |        |       |      |

### 목록 6상태 관찰

| 상태                    | 현재 화면 | 충족 여부 | 개입 / 미개입 근거 |
| ----------------------- | --------- | --------- | ------------------ |
| 데이터 없는 최초 진입   |           |           |                    |
| 이전 데이터가 있는 갱신 |           |           |                    |
| 성공 + 0건              |           |           |                    |
| 최초 실패               |           |           |                    |
| 갱신 실패               |           |           |                    |
| 취소                    |           |           |                    |

### 관찰 → 가설 → 반증 → 최소 변경

각 항목을 한 문장으로 적는다.

| 관찰한 사실 | 원인 가설 | 반증 방법 | 먼저 시도할 가장 작은 변경 |
| ----------- | --------- | --------- | -------------------------- |
|             |           |           |                            |

### metadata 증거

| 상황                           | 증거                                        | 기록 |
| ------------------------------ | ------------------------------------------- | ---- |
| normal                         | document 응답 / 초기 HTML                   |      |
| 정상 empty                     | URL 조건 / 0건 metadata / OG fallback image |      |
| metadata query failure         | root 공통 metadata 상속 여부                |      |
| 서버 호출 계수                 | 임시 로그 계수 / 제거 여부                  |      |
| 일반 UA vs facebookexternalhit | `time_starttransfer`, `time_total`          |      |

---

이 문서는 Claude(AI)가 `docs/assignments/week-07.md`와 현재 레포 상태를 대조해 작성했다. 표는 틀만 만들어 두었고 측정값과 판단은 작성자가 직접 채운다.
