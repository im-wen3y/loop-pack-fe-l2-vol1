# 7주차 진행 순서

7주차는 코드 개선 과제가 아니라 측정 과제다. 합격선(점수·향상률)이 없고, 완료조건이 전부 "Before/After SHA, 5회 raw 값·중앙값·범위, 어떤 구간이 길었고 왜 그 변경을 골랐는지"를 제출물에서 확인할 수 있느냐다.

따라서 **최적화 코드를 먼저 건드리면 안 된다.** Before를 남길 수 없게 된다.

## 시작 시점의 레포 상태

과제 명세와 대조한 결과다.

### 이미 갖춰진 것

- slow scenario — `app/api/home/route.ts`, `app/api/products/route.ts` 둘 다 `?scenario=slow`(1.5초) 지원
- 2단계 재료 상당수 — `placeholderData: keepPreviousData`, `ProductGridSkeleton`, 0건·에러·재시도 UI, nuqs 기반 URL 상태, 서버 응답을 Zustand에 복사하지 않음
- `getServerQueryClient`가 `cache()`로 요청 단위 분리 — 요청 간에는 섞이지 않는다. 다만 **3단계 요구사항과 일치하는지는 아직 확정하지 않았다**(아래 참고)
- Advanced A 측정 화면 — `app/performance-lab/inp/page.tsx`(24개 카드)

### 아직 없는 것

- `getProductList`가 상대경로 `/api/products`로 요청 — 서버에서 호출하면 실패한다 → Step 6에서 `getApiBaseUrl()` 적용
- `generateMetadata`가 한 곳도 없음 — `app/layout.tsx`의 정적 `metadata`만 존재 → Step 6에서 `app/(home)/page.tsx`와 `app/products/page.tsx`에 추가
- 루트 title template·공통 Open Graph 없음 — 페이지 `openGraph`가 shallow merge로 덮어쓸 대상 자체가 없다 → Step 6에서 `app/layout.tsx`에 정의
- Hero 이미지 최적화 없음 — `<img>`로 7.5MB 원본을 그대로 요청 → Step 4에서 측정 근거 확보 후 개입

### 아직 판단하지 않은 것 — `getServerQueryClient`의 `cache()`

명세 141줄은 "서버에서는 `getQueryClient()`를 호출할 때마다 새 QueryClient를 만들어요. metadata와 본문이 QueryClient 캐시를 공유하게 만들려고 singleton이나 영속 캐시로 바꾸지 않아요"라고 적혀 있다.

현재 구현(`src/shared/api/query-client.ts`)은 `cache(() => new QueryClient())`다. 요청 간에는 분리되지만 **같은 요청 안에서는 metadata와 본문이 같은 QueryClient를 공유한다.** 금지 대상인 singleton·영속 캐시는 아니지만 "호출할 때마다 새 인스턴스"도 아니다.

두 해석이 갈린다.

| 해석                                      | 근거                                                               | 결론           |
| ----------------------------------------- | ------------------------------------------------------------------ | -------------- |
| 금지 대상은 요청을 넘어 사는 캐시뿐이다   | 141줄 뒷문장이 `singleton이나 영속 캐시`를 명시한다                | 현재 구현 유지 |
| 문자 그대로 호출마다 새 인스턴스여야 한다 | 체크리스트 262줄이 "호출마다 새 인스턴스가 만들어지고"로 못 박는다 | `cache()` 제거 |

**Step 6에서 확정한다.** 이 판단은 개입 4와 얽혀 있다 — `HeroCopy`와 `HomeData`가 각각 조회해도 요청이 1회인 근거가 이 `cache()`이므로, 떼면 native fetch memoization만 남고 홈 요청 횟수를 서버 측 계수로 다시 세야 한다. Step 6이 어차피 서버 호출 계수를 요구하므로 그 측정에 함께 넣는다.

관련 관찰은 [measurement.md의 "Suspense 경계가 둘인데 요청은 1회다"](measurement.md#suspense-경계가-둘인데-요청은-1회다)에 있다.

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

### Step 2. 서버 전용 origin env로 정리 (코드) — 완료

`src/shared/api/get-api-base-url.ts`의 서버 분기 env를 `NEXT_PUBLIC_BASE_URL` → `APP_ORIGIN`으로 바꿨다. 폴백이 같은 `localhost:3000`이라 Before 측정값에는 영향이 없다.

### Step 3. Before 측정 (측정 · 코드 변경 없음)

`APP_ORIGIN`은 build와 runtime에 같은 값을 넣는다. 미리 렌더된 결과와 요청마다 렌더되는 결과가 서로 다른 origin을 가리키면 차이의 원인을 설명할 수 없다.

```bash
APP_ORIGIN=http://localhost:3000 pnpm build
APP_ORIGIN=http://localhost:3000 pnpm start
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

### Step 4. 1단계 — Hero LCP — 완료

LCP를 네 구간(서버 응답 대기 / 이미지 요청 시작 대기 / 이미지 전송 / 화면에 그려질 때까지)으로 쪼개 관찰한 뒤 개입을 4건 시도했고, 그중 3건을 유지했다. 측정과 판정은 [measurement.md](measurement.md)의 "개입 1"~"개입 요약과 다음 병목"에 있다.

| 개입                         | 결과                               | 상태       |
| ---------------------------- | ---------------------------------- | ---------- |
| 1. 렌더링 경계 분리          | 초기 HTML 첫 flush에 `h1`·Header   | 유지       |
| 2. Hero 이미지 축소          | Lighthouse LCP 8,289.6 → 2,370.2ms | 유지       |
| 3. preload + `fetchpriority` | Lighthouse LCP +77.9ms 악화        | **되돌림** |
| 4. Hero 이미지·카피 분리     | 실측 LCP 662.1 → 123.2ms           | 유지       |

요구사항별 확인은 이렇다.

- 실제 표시 크기·포맷·압축률 — 컨테이너 1200px에 맞춘 `hero-1200.webp`(179KB) / `hero-2400.webp`, q92는 PSNR 47.61dB로 선택
- 시각적 크기·비율·피사체·문구 유지 — CSS를 한 줄도 바꾸지 않았다(`width: 100%`, `aspect-ratio 16/9`, 모바일 `4/5`)
- 렌더링 경계 — Header·`h1`·페이지 설명이 첫 flush에 나간다. `curl`로 초기 HTML에서 `h1` 1개(46,450 byte 중 1,863 byte 지점) 확인
- **Hero fallback의 공간 — 확인했다.** 아래 참고

#### fallback과 layout shift 확인 결과

개입 4로 fallback의 범위가 바뀌었다. 원래는 Hero 전체(`HeroSectionSkeleton`)였는데, 지금은 이미지가 shell로 올라가고 **카피만** `HeroCopySkeleton`으로 기다린다.

- `.copy`가 `.hero` 안에서 `position: absolute`이고 `.hero`는 `aspect-ratio`로 높이가 고정이라, 카피가 교체돼도 아래 콘텐츠가 밀릴 구조가 아니다
- 트레이스에서 `LayoutShift` 이벤트 **0건**, Insights CLS **0** — Before / 개입 1 / 개입 4 모두 동일
- Lighthouse 5회에서도 CLS가 전 구간 0
- filmstrip 117.2ms(카피 스켈레톤)와 571.1ms(카피 채워짐) 두 프레임에서 사진과 카드의 위치·크기가 같다

미확인으로 남은 것 두 가지는 Step 7에서 함께 본다.

- 모바일 분기(`aspect-ratio 4/5`, `object-position 56%`)는 측정하지 않았다. 모든 녹화가 데스크톱 뷰포트다
- Layout shifts track을 캡처한 스크린샷은 없다. 근거는 트레이스 JSON의 `LayoutShift` 이벤트 0건과 Insights CLS 0이다

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
- `getServerQueryClient`의 `cache()` 유지 여부 확정 (위 "아직 판단하지 않은 것" 참고)
- 서버 호출 계수는 임시 서버 로그로 세고 **관찰 후 계측 제거**
- 일반 UA vs `facebookexternalhit` 응답 시점 비교
- 초기 HTML 확인 (View Source 또는 JS 비활성 요청)

### Step 7. 4단계 — After와 회귀

Step 3과 **완전히 같은 조건**에서 재측정한다.

- URL, 행동, viewport, throttling, 브라우저·Lighthouse 버전, cold/warm, 브라우저 프로필 동일
- **After commit SHA 기록**
- LCP element, Hero 전송 크기, 요청 시작 순서, 가장 길었던 구간의 변화 비교
- **Step 4에서 미확인으로 남긴 두 가지**(위 "fallback과 layout shift 확인 결과" 참고)
  - Layout shifts track 캡처 1장 — 지금 근거는 트레이스 JSON의 `LayoutShift` 0건과 Insights CLS 0뿐이다
  - 모바일 뷰포트(`aspect-ratio 4/5`) 녹화 — Step 4까지의 녹화는 전부 데스크톱이다
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

## 측정 기록

측정 조건, Lighthouse 5회, LCP 구간 분해, filmstrip 표시 순서, 목록 6상태, metadata 증거는 [measurement.md](measurement.md)에 있다. Step 3과 Step 7에서 같은 표를 채운다.

---

이 문서는 Claude(AI)가 `docs/assignments/week-07.md`와 현재 레포 상태를 대조해 작성했다.
