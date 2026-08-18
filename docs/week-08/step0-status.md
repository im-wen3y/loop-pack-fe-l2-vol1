# 8주차 0단계 — 현재 상태 점검

과제 문서: `docs/assignments/week-08.md` 0단계
점검 시점 기준 브랜치: `feat/week-08`

## 요약

0단계 요구사항 7개 중 충족된 것은 없다. 테스트 러너(`vitest`)와 E2E 러너(`@playwright/test`)는 이미 있지만, DOM 환경과 MSW는 아직 도입되지 않았다.

## 설치 현황

| 패키지                        | 역할                   | 상태   |
| ----------------------------- | ---------------------- | ------ |
| `@testing-library/react`      | 컴포넌트를 그리고 찾기 | 미설치 |
| `@testing-library/user-event` | 클릭·입력 재현         | 미설치 |
| `@testing-library/jest-dom`   | DOM matcher            | 미설치 |
| `jsdom` 또는 `happy-dom`      | DOM 환경               | 미설치 |
| `msw`                         | 네트워크 요청 가로채기 | 미설치 |
| `@playwright/test`            | E2E                    | 설치됨 |
| `vitest`                      | 단위·통합 러너         | 설치됨 |

## 요구사항별 현황

| 요구사항                                  | 상태   | 근거                                                                    |
| ----------------------------------------- | ------ | ----------------------------------------------------------------------- |
| 두 종류 테스트가 한 명령으로 함께 통과    | 미충족 | `vitest.config.ts`가 `environment: 'node'` 단일 설정, project 분리 없음 |
| 필요한 테스트만 DOM 환경에서 실행         | 미충족 | 위와 동일                                                               |
| 환경 셋업 시간 비교 기록                  | 미충족 | 측정·기록 없음                                                          |
| MSW setup과 unhandled request 차단        | 미충족 | `msw` 미설치, 관련 setup 파일 없음                                      |
| 앱 코드 HTTP 클라이언트 직접 모킹 제거    | 미충족 | `fetch`를 `vi.stubGlobal`로 바꿔치기하는 코드가 남아 있음               |
| Playwright를 production build 위에서 실행 | 미충족 | `playwright.config.ts`의 `webServer.command`가 `pnpm dev`               |
| E2E를 `pnpm test`에 넣을지 결정하고 근거  | 결정   | 별도 명령(`test:e2e`) 유지, CI는 별도 workflow. 근거는 3번 항목         |

`pnpm check`는 이미 존재한다. `pnpm test && pnpm lint && pnpm typecheck && pnpm build` 순서로 실행된다.

## 고쳐야 할 지점

### 1. `vitest.config.ts` — 단일 node 환경

```ts
test: {
  environment: 'node',
  include: ['src/**/*.test.ts', 'app/**/*.test.ts'],
}
```

- 환경이 하나뿐이라 컴포넌트 테스트를 추가할 자리가 없다.
- include 패턴이 `*.test.ts`여서 **`.tsx` 파일이 잡히지 않는다.** `src/examples/week-07-performance/HeroSection.test.tsx`가 현재 실행 대상에서 빠져 있다.

#### 어떤 테스트를 어느 계층에서 검증할지 정하는 순서

테스트를 쓰기 전에 아래 세 질문을 순서대로 묻고, 처음 "그렇다"가 나오는 곳에서 멈춘다.

1. 컴포넌트를 렌더링하지 않고 값이나 상태만 확인해도 되는가? → DOM 없는 단위 테스트 (node)
2. 렌더링된 요소와 상호작용하면 충분한가? → Testing Library + jsdom 통합 테스트
3. 실제 브라우저의 탐색·렌더링·API가 있어야 재현되는가? → Playwright E2E

1과 2의 경계는 "검증하려는 결과가 값과 상태인가, 사용자가 보는 화면인가"이고, 2와 3의 경계는 "jsdom에 없는 것(라우팅, 실제 렌더링, 브라우저별 차이)이 필요한가"다.

이 순서를 적용하면 계층 선택과 vitest 환경 선택이 같은 판단으로 결정된다.

#### 환경 분리 방식

기본 규칙은 **파일 확장자**로 둔다.

| 확장자       | 환경  | 대상                            |
| ------------ | ----- | ------------------------------- |
| `*.test.ts`  | node  | 위 1번에서 멈추는 테스트        |
| `*.test.tsx` | jsdom | 위 2번까지 가는 컴포넌트 테스트 |

컴포넌트를 렌더하려면 JSX가 필요하고 JSX는 `.tsx`에만 쓸 수 있으므로, 확장자가 "화면을 검증하는가"의 신호 역할을 대체로 해준다. 새 테스트를 쓸 때 따로 외울 규칙이 없고 설정도 단순하다는 점을 근거로 골랐다.

다만 확장자는 "JSX를 쓰는가"를 볼 뿐 "화면을 검증하는가"를 직접 보는 것이 아니라서 어긋나는 경우가 생긴다. 그때는 파일 상단의 `// @vitest-environment` 주석으로 해당 파일만 예외를 선언한다.

#### 현재 확인된 예외: `HeroSection.test.tsx`

`src/examples/week-07-performance/HeroSection.test.tsx`는 `.tsx`지만 node 환경에 둔다.

이 파일은 `react-dom/server`의 `renderToStaticMarkup`으로 컴포넌트를 문자열 HTML로 찍고 그 문자열을 검사한다. `document`나 `window`를 쓰지 않아 위 1번에서 멈추는 테스트다.

jsdom에서도 통과하므로 동작 때문에 예외를 두는 것이 아니다. 쓰지 않는 DOM 환경 셋업 비용을 파일마다 치르는 것을 피하려는 것이고, 이 비용이 과제가 요구하는 셋업 시간 비교의 대상이다.

이 파일은 7주차 과제 커밋(`3d42a44`)으로 과제 레포에서 내려온 코드라 테스트 방식을 임의로 바꾸지 않고 예외로 처리한다.

### 2. `fetch` 직접 모킹 — 과제 명시 금지 대상

`src/entities/product/api/api.test.ts`

| 위치    | 코드                                                                                     |
| ------- | ---------------------------------------------------------------------------------------- |
| 22번 줄 | `vi.stubGlobal('fetch', fetchMock)`                                                      |
| 29번 줄 | `vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))` |
| 39번 줄 | `vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))`    |

세 곳 모두 MSW 핸들러로 옮겨야 한다.

#### 왜 앱 코드를 고치지 않는가

테스트를 통과시키려고 앱 코드를 고치면 테스트가 검증하는 코드와 실제로 배포되는 코드가 달라진다. 그러면 그 테스트가 통과해도 배포된 것에 대해 보장하는 바가 없다. 과제가 "요청은 실제로 나가고 MSW가 가로채는 구조"를 요구하는 이유가 이것이다.

`getProductList`는 다음과 같이 상대 경로로 요청한다. 이 코드는 그대로 두고 테스트 환경 쪽을 맞춘다.

```ts
response = await fetch(`/api/products${query}`)
```

#### MSW를 쓰는 두 가지 방식

| 실행 위치 | 사용처              | 가로채는 방법                        | 준비물                                              |
| --------- | ------------------- | ------------------------------------ | --------------------------------------------------- |
| 브라우저  | Playwright, 개발 중 | Service Worker                       | `public/mockServiceWorker.js` (`msw init`으로 생성) |
| Node      | vitest 통합 테스트  | `fetch`·`http`·`XMLHttpRequest` 패치 | 없음, `setupServer`만                               |

이번 주 통합 테스트는 vitest에서 돌므로 Node 방식을 쓴다. `msw init`은 필요 없다.

MSW가 `fetch`를 교체한다는 점은 `vi.stubGlobal('fetch', ...)`과 같아 보이지만 다르다. `stubGlobal`의 대체본은 호출을 기록하고 지정한 값을 돌려주는 것으로 끝난다. MSW의 대체본은 요청을 정상적인 `Request`로 만들어 핸들러에 넘기고 실제 `Response`를 돌려주며, 매칭되는 핸들러가 없으면 실제 네트워크로 내보낸다. 앱 코드 입장에서는 구분되지 않는다.

#### 상대 경로가 걸리는 지점

MSW 문서 [Intercepting Requests](https://mswjs.io/docs/http/intercepting-requests)는 다음과 같이 적고 있다.

> Relative URL predicates are resolved against the current document's location, requiring base URL configuration in Node.js tests.

해석 기준이 `document.location`이고, 이 해석은 두 곳에서 각각 일어난다.

```
앱 코드    fetch('/api/products?page=1')
                  ↓ location 기준 절대화
           http://localhost:3000/api/products?page=1
                  ↓
               매칭 시도
                  ↑
           http://localhost:3000/api/products
                  ↑ location 기준 절대화
핸들러     http.get('/api/products', ...)
```

요청 쪽과 핸들러 predicate 쪽 모두 상대 경로면 `location`을 본다. node 환경에는 `location`이 없어 양쪽 다 기준이 없다.

[디버깅 런북](https://mswjs.io/docs/runbook)은 이 상황의 진단 방법을 준다.

```ts
server.events.on('request:start', ({ request }) => {
  console.log(request.method, request.url)
})
```

여기 찍히는 `request.url`이 절대 URL이어야 정상이고, 상대 경로가 찍히면 그것이 원인이다. 문서의 권고도 앱 코드가 아니라 테스트 환경의 `location.href`를 설정하라는 것이다.

#### 결정: `api.test.ts`만 jsdom 예외

jsdom은 인스턴스 생성 시 URL을 받고 그것이 `location.href`가 된다. 기본값이 `http://localhost:3000`이지만 이유가 드러나도록 명시한다.

```ts
// vitest.config.ts
environmentOptions: {
  jsdom: { url: 'http://localhost:3000' },
}
```

`api.test.ts`는 화면을 검증하지 않지만 `location`이 필요하므로 파일 상단 docblock으로 예외를 선언한다. config에 패턴을 추가하지 않는 이유는, 해당 파일이 현재 하나뿐이고(`queries.test.ts`는 query key 조립만 보므로 네트워크를 타지 않는다) 예외의 이유가 파일 옆에 남는 편이 낫기 때문이다.

```ts
/**
 * @vitest-environment jsdom
 *
 * getProductList가 `/api/products` 상대 경로로 요청한다. MSW는 상대 경로를
 * document.location 기준으로 절대화하는데 node 환경에는 location이 없다.
 * 앱 코드를 고치는 대신 이 파일만 location이 있는 환경에서 돌린다.
 * 화면을 검증하는 파일은 아니다.
 */
```

docblock은 파일 맨 위, `import`보다 앞에 있어야 vitest가 읽는다.

이 예외가 3개를 넘어가면 "확장자는 대략의 신호"라는 설명이 성립하지 않는 것이므로 분리 규칙 자체를 다시 본다.

### 3. `playwright.config.ts` — dev 서버 위에서 실행

```ts
webServer: {
  command: 'pnpm dev',
  ...
}
```

#### 지연은 dev와 production이 같다

`waitForMockApi`는 다음과 같다.

```ts
export const waitForMockApi = (requestedDelayMs = 500) =>
  new Promise<void>((resolve) => {
    const delayMs = process.env.NODE_ENV === 'test' ? 0 : requestedDelayMs
    setTimeout(resolve, delayMs)
  })
```

지연이 0이 되는 것은 `NODE_ENV === 'test'`일 때뿐이다. `next dev`는 `development`, `next start`는 `production`이므로 둘 다 500ms가 걸린다. 즉 production으로 바꾸는 이유는 지연 때문이 아니다.

#### production을 쓰는 이유

| 항목          | `next dev`                          | `next start`       |
| ------------- | ----------------------------------- | ------------------ |
| 번들          | 최적화 안 됨, HMR 포함              | 실제 배포되는 번들 |
| React         | dev 전용 경고, StrictMode 이중 렌더 | 없음               |
| 첫 요청       | 라우트를 그때 컴파일                | 미리 빌드됨        |
| 빌드 에러     | 페이지를 열 때 발견                 | 빌드 단계에서 발견 |
| mock API 지연 | 500ms                               | 500ms (동일)       |

dev에서만 도는 코드 경로가 있어 dev 서버로 통과한 결과는 배포되는 것에 대해 보장하지 않는다. 2번의 "앱 코드를 고치지 않는다"와 같은 이유다.

#### 빌드와 실행을 분리한다

`webServer.command`를 `pnpm build && pnpm start`로 두면 E2E를 돌릴 때마다 빌드가 돈다. 테스트 하나를 고쳐 다시 돌릴 때도 마찬가지라 비용이 크다.

대신 빌드를 스크립트로 옮긴다.

```ts
// playwright.config.ts
webServer: {
  command: 'pnpm start',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
```

```json
// package.json
"test:e2e": "pnpm build && playwright test"
```

| 명령                        | 빌드  | 용도                                  |
| --------------------------- | ----- | ------------------------------------- |
| `pnpm test:e2e`             | 함    | 기본. CI와 제출 전                    |
| `pnpm exec playwright test` | 안 함 | 빌드가 최신인 상태에서 반복 실행할 때 |

분리하면 오래된 빌드로 테스트할 수 있게 되는 위험이 생긴다. 그래서 기본값을 안전한 쪽(빌드하는 쪽)에 두고, 빠른 쪽은 명시적으로 고르게 한다. 반대로 두면 오래된 빌드로 통과하는 상황이 조용히 지나간다.

`next build`는 `.next/cache`를 재사용하므로 변경이 없으면 콜드 빌드보다 빠르다.

#### E2E는 `pnpm check`에 넣지 않고 별도 명령으로 둔다

과제 요구사항 중 "E2E를 `pnpm test`에 넣을지 별도 명령으로 둘지 결정하고 근거를 남겨요"에 대한 결정이다.

`pnpm check`는 지금 구성을 유지하고 E2E는 `pnpm test:e2e`로 분리한다. 이유는 아래 CI 구성과 맞물린다. `pnpm check`를 돌리는 CI job과 E2E job이 필요한 브라우저 설치 조건이 다르기 때문에, 하나의 명령으로 묶으면 두 job이 같은 준비 과정을 요구하게 된다.

#### CI에서 실행한다 — husky가 아니라 GitHub Actions

|              | husky              | GitHub Actions |
| ------------ | ------------------ | -------------- |
| 실행 위치    | 개발자 로컬 머신   | GitHub 서버    |
| 시점         | commit / push      | PR, main push  |
| 우회         | `--no-verify` 가능 | 불가           |
| 다른 사람 PR | 막지 못함          | 막음           |

E2E는 GitHub Actions에 둔다. husky는 로컬 훅이라 본인 머신에서만 돌고 우회할 수 있어 게이트 역할을 하지 못한다. 빌드와 브라우저 2종을 커밋마다 로컬에서 돌리는 것도 현실적이지 않다. 현재 `.husky/pre-commit`의 `lint-staged`처럼 빠르고 변경 파일만 보는 작업이 로컬 훅의 적정 범위다.

#### 별도 job으로 분리한다

현재 `.github/workflows/quality.yml`은 Chromium만 설치한다.

```yaml
- name: Install Playwright Chromium when used
  run: |
    if pnpm exec playwright --version >/dev/null 2>&1; then
      pnpm exec playwright install --with-deps chromium
    fi
```

그런데 `playwright.config.ts`에는 chromium과 webkit 두 프로젝트가 있다. webkit 설정에는 "Safari는 버튼 클릭 시 자동 포커스를 주지 않아, 마우스로 연 후 키보드로 조작하는 흐름이 chromium에서만 통과하고 여기선 깨질 수 있다(실제로 한 번 잡았다)"는 주석이 붙어 있다. 실제로 결함을 잡은 설정이므로 CI를 통과시키려고 제거하지 않는다.

그래서 E2E를 별도 workflow로 두고 그 job에서만 두 브라우저를 설치한다.

- `quality.yml`은 그대로 둔다. 과제 레포에서 내려온 파일이라 수정 시 이후 동기화에서 충돌할 수 있다.
- 새 workflow 파일을 추가해 `playwright install --with-deps chromium webkit` 후 `pnpm test:e2e`를 실행한다.
- 두 workflow가 병렬로 돌아 전체 소요 시간이 크게 늘지 않는다.

검토만 하고 머지를 막지 않는 방식은 택하지 않는다. 막지 않는 검사는 빨간불이 유지된 채로 방치되기 쉽고, 3단계에서 "구현을 망가뜨려 테스트가 잡는지 확인"하는 목적과도 어긋난다. 잡아도 막지 못하면 잡은 것이 아니다.

### 4. `create-collection-store.test.ts`의 `stubGlobal` — 결론: 현행 유지

이 파일 22~23번 줄이 `localStorage`와 `window`를 `vi.stubGlobal`로 만들고 있다. HTTP 클라이언트가 아니라 과제의 금지 대상은 아니다.

`it` 5개를 위 판단 순서로 확인하면 전부 1번에서 멈춘다.

| 검증 대상                             | 단언 위치              | 계층 |
| ------------------------------------- | ---------------------- | ---- |
| toggle로 추가하고 다시 누르면 제거    | `store.getState().ids` | node |
| 순서와 중복 없는 집합 유지            | `store.getState().ids` | node |
| selector로 포함 여부·개수·action 선택 | `store.getState()`     | node |
| 손상된 저장값을 빈 목록으로 복구      | `store.getState().ids` | node |
| 이전 버전 ids를 현재 상태로 migration | `store.getState().ids` | node |

단언이 모두 `store.getState()`를 향한다. `localStorage`를 단언하는 곳은 없고, 4·5번의 `localStorage.setItem`은 "이미 저장돼 있던 상황"을 만드는 준비 과정이다. 즉 이 파일이 검증하는 것은 store의 상태 전이와 복원 로직이지 localStorage 자체가 아니다.

그럼에도 `stubGlobal`이 필요한 이유는 `createCollectionStore`가 `persist` 미들웨어로 감싸져 있어 store를 만드는 것만으로 `localStorage`를 요구하기 때문이다. 검증을 위한 모킹이 아니라 node 환경에 없는 것을 채워 넣는 코드다.

jsdom으로 옮기면 실제 `localStorage`가 제공되어 `createMemoryStorage` 15줄과 `stubGlobal` 2줄이 `localStorage.clear()` 한 줄로 줄어든다. 그러나 이 파일은 화면을 검증하지 않으므로 위 분리 기준상 node가 맞다. 코드 15줄을 줄이려고 DOM 환경 셋업 비용을 치르는 교환은 하지 않는다.

### 5. 확인이 필요한 지점

- 과제 문서는 "지금 레포의 테스트 5개"라고 적고 있으나, 현재 include 패턴에 잡히는 테스트 **파일**은 7개다. 과제가 파일 수가 아닌 테스트 케이스 수를 말하는 것인지, 기준 레포와 갈라진 차이인지 확인이 필요하다.

## 현재 테스트 파일 목록

include 패턴에 잡히는 파일:

```
app/api/home/route.test.ts
app/api/products/route.test.ts
app/api/_data/commerce.test.ts
src/app/performance-lab/inp/products.test.ts
src/entities/product/api/api.test.ts
src/entities/product/api/queries.test.ts
src/shared/lib/create-collection-store.test.ts
```

패턴에서 빠져 실행되지 않는 파일:

```
src/examples/week-07-performance/HeroSection.test.tsx
```

E2E:

```
e2e/week-05-state.spec.ts
```

## 다음 작업 순서

1. 의존성 설치
2. `vitest.config.ts` 환경 분리 (include에 `.tsx` 포함, `environmentOptions.jsdom.url` 명시)
3. MSW setup 작성, unhandled request 차단
4. `api.test.ts`의 `fetch` stub 3곳을 MSW로 교체
   - 먼저 node 환경 그대로 돌려 실제로 실패하는지 확인한다. `request:start` 리스너로 `request.url`을 찍어 상대 경로가 나오는 것을 관찰한 뒤 docblock을 붙인다. 주석의 근거가 추측이 아니라 관찰이 되도록 한다.
5. `playwright.config.ts`의 `webServer.command`를 `pnpm start`로 변경, `test:e2e` 스크립트에 빌드 추가
6. E2E용 GitHub Actions workflow 추가 (chromium·webkit 설치, `pnpm test:e2e` 실행)
7. 셋업 시간 비교 측정 후 이 문서에 기록

---

이 문서의 현황 조사(설치 현황, 요구사항별 충족 여부, 파일 목록, `stubGlobal` 위치)는 Claude가 레포를 읽고 과제 요구사항과 대조해 작성했다.

아래 판단은 작성자가 Claude와 논의하며 직접 내렸다.

- "어떤 테스트를 어느 계층에서 검증할지 정하는 순서"의 세 질문
- 확장자 기준 환경 분리 선택
- `HeroSection.test.tsx`를 예외로 두는 결정
- `create-collection-store.test.ts`를 node에 유지하는 결정
- 앱 코드를 고치지 않는다는 결정
- 빌드와 E2E 실행을 분리한다는 결정
- E2E를 CI에서 실행한다는 결정과 별도 job 분리

Claude는 각 선택의 반례(`.tsx`인데 DOM이 불필요한 파일, `.ts`인데 DOM이 있으면 편한 파일)와 jsdom 환경의 동작 방식, MSW 인터셉트 구조, husky와 GitHub Actions의 차이를 제시하는 역할을 했다.

`api.test.ts`만 jsdom 예외로 두는 방식과 별도 workflow 파일을 추가하는 방식은 Claude가 제안했고 작성자가 받아들였다.

`waitForMockApi`의 지연이 dev와 production에 동일하게 걸린다는 점은 Claude가 앞서 "production에서만 걸린다"고 잘못 적었던 것을 코드 확인 후 수정한 내용이다.

MSW의 상대 경로 처리 내용은 공식 문서([Intercepting Requests](https://mswjs.io/docs/http/intercepting-requests), [디버깅 런북](https://mswjs.io/docs/runbook))에서 확인한 것이다.

테스트는 실행하지 않았다. 파일 목록과 설정 내용은 정적 확인만 거쳤다. node 환경에서 상대 경로 요청이 실제로 어떻게 실패하는지는 관찰하지 않았으므로 4번 단계에서 확인해야 하고, 셋업 시간 비교는 환경 분리 이후 측정해 채워야 한다.
