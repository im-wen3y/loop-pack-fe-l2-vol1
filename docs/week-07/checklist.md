# 7주차 체크리스트

7주차 발제(성능 최적화: 사용자 경로별 병목 측정과 개선)의 체크리스트다. 진행 순서와 측정 기록 틀은 [plan.md](plan.md)에 있다.

⚠️ 발제 슬라이드와 과제 명세(`docs/assignments/week-07.md`)가 어긋나는 항목은 **명세를 따른다.** 슬라이드는 정적 `metadata`면 충분하다고 하지만 명세 3단계는 `generateMetadata`와 Open Graph를 요구한다.

## 이번 주에 다루지 않는 것

- Basic에서 Next Cache API를 새로 도입하지 않는다. 캐시는 Advanced B에서만 선택한다.
- `cacheComponents`를 누적 과제 브랜치에서 바로 켜지 않는다.
- OG 이미지 생성(`opengraph-image`), sitemap, robots 정책, JSON-LD까지 확장하지 않는다. 동적 `metadata`와 Open Graph 필드 자체는 명세 3단계의 필수 범위다.
- 가상화나 무거운 라이브러리를 과제를 위해 새로 추가하지 않는다.
- API의 고정 지연(1.5초)을 줄이거나 제거해서 개선했다고 제출하지 않는다.
- 여러 최적화 기법을 한 번에 적용하지 않는다.

## 공통 측정

- [ ] production build(`pnpm build && pnpm start`)에서 측정했는가
- [ ] URL·사용자 행동·viewport·throttling을 기록했는가
- [ ] cold load와 warm navigation을 구분했는가
- [ ] Lighthouse 5회와 중앙값을 남겼는가
- [ ] Before / After commit SHA와 원값(최솟값·최댓값)을 남겼는가
- [ ] 변경 전 원인 가설과 반증 방법을 기록했는가
- [ ] 같은 조건의 Before / After를 비교했는가
- [ ] 변화가 측정 흔들림보다 컸는지 확인했는가

## 홈 히어로와 렌더링 경계

- [ ] 실제 FCP와 LCP element를 확인했는가
- [ ] 느린 hero 데이터가 셸까지 막는지 확인했는가
- [ ] 헤더·`h1`·설명 같은 RSC 셸이 먼저 렌더링되는가
- [ ] 느린 영역이 선택한 경계의 Suspense fallback 또는 Query pending UI에서 기다리는가
- [ ] streaming, Client Query, hydration 중 선택한 이유를 설명했는가
- [ ] RSC가 자기 Route Handler를 HTTP로 호출하지 않는가

### 렌더링 경계 선택 기준

| 상황                                         | 먼저 검토할 경로            | 선택 이유                                     |
| -------------------------------------------- | --------------------------- | --------------------------------------------- |
| 읽기 중심이고 서버에서 바로 조합할 수 있다   | async RSC + `Suspense`      | Client JS 없이 서버 결과를 스트리밍할 수 있다 |
| URL 조건이 자주 바뀌고 브라우저 cache를 쓴다 | Client `useQuery`           | pending·refetch·prefetch를 한 계약에서 관리   |
| 초기 HTML에도 데이터가 필요하고 이후 Query가 | server prefetch + hydration | 서버 Query Cache를 브라우저가 이어받는다      |

`Suspense`는 어느 UI를 먼저 보낼지 정하고, `HydrationBoundary`는 서버 QueryClient 스냅샷을 브라우저에 전달한다. 같은 기능이 아니다. Client `useQuery`로 브라우저에서 가져오는 것은 streaming도 selective hydration도 아니다.

## CLS와 느린 API UX

- [ ] fallback이 실제 hero·목록과 비슷한 공간을 예약하는가
- [ ] fallback이 실제 카드와 같은 grid·이미지 비율·responsive CSS를 쓰는가
- [ ] Layout shifts track에서 이동한 요소를 확인했는가
- [ ] 최초 `isPending`과 갱신 중 `isFetching`을 다르게 보여주는가
- [ ] query key에 서버 응답을 바꾸는 조건이 모두 있는가
- [ ] queryFn의 `AbortSignal`을 실제 `fetch`에 전달했는가
- [ ] 빠른 연속 변경 뒤 URL과 상품 결과가 일치하는가
- [ ] 이전 데이터·prefetch·cancellation 중 필요한 전략을 증거로 선택했거나 무개입 근거를 남겼는가
- [ ] 갱신 실패·빈 결과·취소를 서로 다른 상태로 처리했는가
- [ ] slow API의 고정 지연을 제거하지 않았는가

서버 대기 시간(1.5초)과 INP를 같은 숫자로 부르지 않는다. INP는 클릭 뒤 다음 paint가 메인 스레드 작업으로 얼마나 막혔는지를 본다.

## SEO

- [ ] 페이지마다 의미 있는 title과 description이 있는가
- [ ] 초기 응답에 하나의 명확한 `h1`과 설명이 있는가
- [ ] `main`, `nav`, `section`의 역할을 설명할 수 있는가
- [ ] 주요 이동 경로가 `href`를 가진 링크인가
- [ ] 의미 있는 이미지에 적절한 `alt`가 있는가
- [ ] Network Response나 View Source에서 초기 HTML을 확인했는가

Elements 패널은 JavaScript 실행 뒤의 DOM이다. 서버가 만든 HTML은 `curl -s http://localhost:3000/products`, View Source, JS 비활성 요청으로 확인한다.

위 항목은 발제의 Basic 범위다. 이 레포의 과제 명세 3단계는 여기에 더해 `generateMetadata`, 루트 title template·공통 Open Graph, shallow merge 처리, 정상 empty와 query failure의 서로 다른 fallback, 서버 호출 계수, 일반 UA와 `facebookexternalhit` 응답 시점 비교까지 요구한다. 해당 체크 항목은 `docs/assignments/week-07.md`에 있고 진행 순서는 [plan.md](plan.md) Step 6에 있다.

## Advanced A — INP (선택)

- [ ] `pageSize=24`와 API 로딩 완료 조건에서 측정했는가
- [ ] Performance에서 `4x slowdown`과 같은 찜 클릭을 사용했는가
- [ ] 같은 초기 찜 상태에서 Before / After를 각각 3회 반복했는가
- [ ] Interaction의 input·processing·presentation 구간을 기록했는가
- [ ] Profiler에서 Before의 전체 카드 렌더를 확인했는가
- [ ] selector 또는 컴포넌트 경계를 바꾼 근거가 있는가
- [ ] After에서 관계없는 카드의 렌더가 줄었는가
- [ ] 카드 수·필수 계산·즉시 피드백을 제거하지 않았는가
- [ ] Lighthouse TBT를 INP 증거로 제출하지 않았는가

측정 없이 `memo`부터 붙이지 않는다. 넓은 selector(`state.wishlistIds` 배열 전체 구독)를 필요한 값(boolean)으로 좁히는 것이 먼저다. 렌더 원인은 `pnpm next build --profile`로 만든 profiling build에서 확인하고, 그 commit 시간을 일반 production build 숫자와 직접 비교하지 않는다.

## Advanced B — Next Cache (선택)

- [ ] 별도로 검증한 `cacheComponents: true` starter에서 진행했는가
- [ ] 전체 document·반복 HTTP 측정 경로와 client navigation 경로를 나누고 실제 경로에 있는 캐시만 그렸는가
- [ ] 캐시의 저장 위치·재사용 범위·신선도 시계·무효화 사건을 기록했는가
- [ ] cold miss와 warm hit의 서버 요청 여부, request counter, 원본 호출 횟수와 표시 시점을 비교했는가
- [ ] 같은 비교에서는 `measurementRunId`를 유지하고 `dataVersion`을 캐시 키에서 제외했는가
- [ ] `revalidateTag(tag, "max")`를 골랐다면 첫 읽기의 이전 값과 원본 재호출, 갱신 완료 신호, 그 뒤 읽기의 새 값을 확인했는가
- [ ] `updateTag(tag)`를 골랐다면 첫 읽기가 새 값을 기다리고 이전 값을 노출하지 않았는가
- [ ] `router.refresh()`를 서버 캐시 무효화로 설명하지 않았는가
- [ ] Next Cache와 Query Cache의 TTL 숫자만 맞추지 않았는가
- [ ] Redis·CDN·다중 인스턴스 구현을 과제에 추가하지 않았는가

| 사용자 경험                                    | 선택                        |
| ---------------------------------------------- | --------------------------- |
| 잠깐 이전 값을 보여줘도 되고 빠른 응답이 중요  | `revalidateTag(tag, "max")` |
| 방금 저장한 값을 같은 사용자에게 바로 보여준다 | `updateTag(tag)`            |
| 특정 page·layout의 렌더 결과를 다시 확인       | `revalidatePath(path)`      |
| 브라우저 Query Cache만 다시 가져온다           | `invalidateQueries()`       |

## 회귀와 설명

- [ ] URL, Query, Zustand, 로컬 상태의 책임이 유지되는가
- [ ] 검색·카테고리·정렬·페이지가 URL에서 복원되는가
- [ ] 뒤로 가기와 앞으로 가기가 같은 화면을 복원하는가
- [ ] 장바구니·위시리스트와 Header 개수가 일치하는가
- [ ] FSD 의존 방향과 Public API가 유지되는가
- [ ] 로딩·에러·빈 상태·재시도가 동작하는가
- [ ] 효과가 없던 변경을 되돌리거나 유지 이유를 기록했는가
- [ ] `pnpm check`가 통과하는가
- [ ] 왜 이렇게 설계했는지 한 줄 근거가 있는가
- [ ] AI로 생성한 부분을 표기하고 직접 검토했는가

Basic의 미흡함을 Advanced 구현으로 상쇄하지 않는다. Advanced A와 B는 독립된 선택 과제이고, 도전한다면 둘 다 하는 것보다 하나를 재현·가설·변경·검증까지 끝내는 편이 낫다.

---

이 문서는 Claude(AI)가 7주차 발제 자료를 이 레포 기준으로 정리해 작성했다. 체크 항목은 작성자가 직접 확인하며 채운다.
