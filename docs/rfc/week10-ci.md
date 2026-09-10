# Week 10 CI 측정과 개선 기록

## 측정 조건

### 현재 workflow와 명령 대조

#### Quality

`.github/workflows/quality.yml`은 마지막 step에서 `pnpm check`를 실행한다. `package.json`의 script를
따라가면 실제 실행 순서는 다음과 같다.

```text
pnpm check
└─ pnpm verify && pnpm build
   ├─ pnpm test
   ├─ pnpm lint
   ├─ pnpm typecheck
   └─ pnpm build
```

현재 GitHub Actions에서는 네 검증이 `Run quality checks`라는 하나의 step으로 실행되기 때문에
각각의 시간을 구분할 수 없다. Before를 측정하기 전에 다음처럼 step을 나누면 test, lint,
typecheck와 build 중 어느 구간이 오래 걸리는지 로그에서 따로 확인할 수 있다.

```yaml
- name: Run unit tests
  run: pnpm test

- name: Run lint
  run: pnpm lint

- name: Run typecheck
  run: pnpm typecheck

- name: Run production build
  run: pnpm build
```

이때 기존 `pnpm check`를 함께 실행하면 같은 검증이 중복되므로, 네 step으로 나눈 뒤에는 기존
`Run quality checks` step을 남기지 않는다. 검증 항목을 줄이기 위한 변경이 아니라 각 구간의 시간을
확인하기 위한 분리다. step 분리 자체가 실행 시간에 작은 영향을 줄 수 있으므로, 분리한 workflow를
Before 기준으로 먼저 고정하고 After도 같은 구조에서 측정한다.

#### E2E

`.github/workflows/e2e.yml`은 `pnpm test:e2e`를 실행하고, 이 script는 `pnpm build` 후 Playwright
테스트를 실행한다.

```text
pnpm test:e2e
├─ pnpm build
└─ playwright test
```

E2E는 실제 Chromium과 WebKit을 사용하므로 브라우저 설치가 필요하다. Quality와 달리 E2E의
브라우저 설치 step은 사용되지 않는 준비 작업으로 볼 수 없다.

### Week 09 참고 실행

#### 참고 실행의 조건

- 대상: Week 09 PR #181
- 실행 결과: 성공
- 러너: `ubuntu-latest`
- GitHub Actions runner: `2.337.0`
- 운영체제: Ubuntu 24.04.4 LTS
- Runner Image: `ubuntu-24.04`
- Runner Image 버전: `20260831.293.1`
- Hosted Compute Agent 버전: `20260828.587`
- Quality Azure Region: `northcentralus`
- E2E Azure Region: `centralus`
- `GITHUB_TOKEN` 권한: `contents: read`, `metadata: read`
- Secret source: `None`
- Quality pnpm dependency cache: warm, 복원 성공
- Quality Next.js build cache: 없음
- E2E pnpm dependency cache: warm, 복원 성공
- E2E Next.js build cache: 없음
- 분류: Before 반복 측정에 포함하지 않는 참고 실행

Quality와 E2E는 runner, OS, Runner Image와 이미지 버전이 같았다. 서로 다른 VM에서 실행되므로
Worker ID는 달랐고 Azure Region도 달랐다. 따라서 같은 `ubuntu-latest` 조건이어도 물리적 실행
환경과 네트워크 조건이 완전히 같다고 볼 수는 없으며, 한 번의 시간 차이만으로 개선 효과를 확정하지
않는다.

두 실행 모두 같은 pnpm cache key의 약 197MB store를 복원했다. Quality의 `Set up Node.js`는
10초, E2E는 9초였고 `Install dependencies`는 둘 다 2초였다. 두 실행 모두 pnpm cache 기준
warm이지만 변경 전 Week 09 참고 실행이므로 새 기준 workflow의 Before 3회에는 포함하지 않는다.

#### Quality 상세 시간

| 범위                                  |     시간 |
| ------------------------------------- | -------: |
| Quality workflow 전체                 | 1분 23초 |
| quality job                           | 1분 18초 |
| Set up job                            |      1초 |
| Checkout                              |      1초 |
| Set up pnpm                           |      3초 |
| Set up Node.js                        |     10초 |
| Install dependencies                  |      2초 |
| Install Playwright Chromium when used |     24초 |
| Run quality checks                    |     33초 |
| Post Set up Node.js                   |      0초 |
| Post Set up pnpm                      |      1초 |
| Post Checkout                         |      0초 |
| Complete job                          |      0초 |

`Run quality checks` 로그에서 추가로 확인한 값은 다음과 같다.

| 내부 명령 또는 출력 구간 | 확인한 시간 | 측정 범위                            |
| ------------------------ | ----------: | ------------------------------------ |
| `vitest run`             |      9.66초 | Vitest가 출력한 전체 test duration   |
| Next.js compile          |       3.7초 | build 내부 compile 구간              |
| Next.js TypeScript       |       3.8초 | build 내부 TypeScript 구간           |
| 17개 static page 생성    |       211ms | build 내부 page 생성 구간            |
| `pnpm lint`              |   구분 불가 | 시작 로그만 있고 전체 종료 시간 없음 |
| `pnpm typecheck`         |   구분 불가 | 시작 로그만 있고 전체 종료 시간 없음 |
| `pnpm build` 전체        |   구분 불가 | 일부 내부 구간만 출력됨              |

따라서 이 로그만으로 test, lint, typecheck와 build 네 명령의 정확한 개별 wall-clock을 모두 구할 수는
없다. 네 명령을 GitHub Actions의 별도 step으로 나누면 각 step의 시간을 같은 형식으로 확인할 수
있다.

테스트는 29개 파일의 164개 테스트가 모두 통과했다. Zustand persist storage 관련 메시지가
`stderr`에 반복됐지만 테스트 실패로 이어지지는 않았다. build 로그에는 E2E와 마찬가지로
`No build cache found`가 출력됐다.

Quality의 `Set up Node.js` 로그에서도 E2E와 같은 pnpm cache key, 약 197MB cache,
`Cache restored successfully`를 확인했다. 따라서 Quality 역시 pnpm dependency cache 기준
warm이고 Next.js build cache는 없는 실행이다.

#### 확인한 사실

이 실행에서 Chromium 설치에는 24초가 걸렸고, `pnpm check`는 Playwright E2E를 실행하지 않았다.
따라서 Quality의 Chromium 설치는 실제 Quality 검증에 사용되지 않는다. 반면 test, lint,
typecheck와 build는 과제에서 유지해야 하는 검증이다.

#### 개선 가설

Quality에서 Chromium 설치 step만 제거하면 필요한 검증을 유지하면서 quality job과 workflow 전체
시간이 줄어들 것으로 예상한다. 다만 24초는 한 번의 실행에서 관찰한 설치 시간이지 확정된 단축량은
아니다. 실제 감소 폭은 같은 조건의 Before/After cold·warm 반복 측정으로 확인한다.

#### E2E 참고 시간

| 범위                        |     시간 |
| --------------------------- | -------: |
| E2E workflow 전체           | 2분 30초 |
| e2e job                     | 2분 26초 |
| Set up job                  |      1초 |
| Checkout                    |      2초 |
| Set up pnpm                 |      3초 |
| Set up Node.js              |      9초 |
| Install dependencies        |      2초 |
| Install Playwright browsers |     47초 |
| Run E2E tests               | 1분 19초 |
| Post Set up Node.js         |      0초 |
| Post Set up pnpm            |      1초 |
| Post Checkout               |      0초 |
| Complete job                |      0초 |

E2E의 step별 시간은 확인했다. `Run E2E tests` 로그에서 production build 후 Chromium과 WebKit의
30개 테스트를 4 workers로 실행했고, 모두 통과했다. Playwright가 출력한 테스트 시간은
1.2분이었다.

build 로그에서는 다음 시간을 확인했다.

- optimized production build compile: 3.5초
- TypeScript: 3.4초
- 17개 static page 생성: 179ms

다만 이 값만 더해 build 전체 wall-clock을 확정할 수는 없다. `Run E2E tests` 1분 19초는 shell에서
측정한 전체 step 시간이고, Playwright의 1.2분은 소수점 한 자리로 반올림된 테스트 시간이다.

`Set up Node.js` 로그에서는 다음 pnpm dependency cache 증거를 확인했다.

- Node: `.nvmrc`에서 해석한 `24.17.0`, Linux x64
- cache key: `node-cache-Linux-x64-pnpm-4a4700f92bc4c477613076faf7033fe016210cf5d6a9cb6fb03827e2819d41f9`
- cache size: 약 197MB
- `Cache hit for`, `Cache restored successfully`, `Cache restored from key` 출력

따라서 이 E2E 실행은 pnpm dependency cache 기준으로 warm이다. 반면 build 로그에는
`No build cache found`가 출력됐으므로 Next.js build cache는 없었다. 서로 다른 캐시이므로 이
실행을 모든 캐시가 warm 또는 cold였다고 한 단어로 묶지 않는다.

## Before

### 측정 전 준비

- [x] Quality의 test, lint, typecheck와 build를 각각 별도 step으로 나눈다
- [x] Quality와 E2E job에 `timeout-minutes: 10`을 추가한다
- [x] 네 검증이 기존 `pnpm check`와 동일하게 유지되는지 대조한다
- [x] 기준 커밋과 Actions run URL을 기록한다
- [x] cold와 warm을 만드는 방법과 캐시 복원 로그의 확인 위치를 정한다
- [x] workflow 전체, job, 주요 step 시간을 기록할 표를 준비한다

### 기준 workflow 변경 이력

- Quality에서 사용하지 않는 Chromium 설치 step을 제거했다.
- Quality의 `pnpm check`를 test, lint, typecheck와 build 네 step으로 나눴다.
- E2E의 `pnpm test:e2e`를 production build와 Playwright test 두 step으로 나눴다.
- Quality와 E2E job에 `timeout-minutes: 10`을 추가했다.
- `pnpm verify` 결과 29개 파일의 164개 테스트, lint와 typecheck가 통과했다.
- production build와 Playwright는 저장소의 런타임 검증 규칙에 따라 로컬에서 실행하지 않았다.
- warm과 cold 각 3회차의 Quality/E2E Actions run URL과 커밋 SHA,
  workflow/job/주요 step 시간과 캐시 로그를 모두 기록했다.

### 측정 기록

#### Cold

| 회차 | 커밋 / run URL                                                                                                                                                                                                                                                        |                   workflow 전체 |                             job | 주요 step                                                                                                                           | 캐시 증거                                                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------: | ------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34442468386)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34442468432)<br>커밋 `b9e92f8ff29996cdb075c2afd36f66263512b1ba`                                   |     Quality 50초<br>E2E 2분 6초 |     Quality 47초<br>E2E 2분 3초 | Quality: install 5초, test 9초, lint 7초, typecheck 3초, build 7초<br>E2E: install 5초, browser 설치 44초, build 8초, E2E 48초      | Quality/E2E: `pnpm cache is not found`<br>E2E 후처리의 동일 키 저장은 Quality와의 동시 생성으로 충돌했으나 job은 성공                        |
| 2    | [Quality job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34443757239/job/102763993670)<br>[E2E job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34443757278/job/102763993821)<br>커밋 `de540b8d435b3c452f38a096d1396fd76662105e` | Quality 1분 6초<br>E2E 2분 49초 | Quality 1분 3초<br>E2E 2분 46초 | Quality: install 6초, test 12초, lint 9초, typecheck 4초, build 10초<br>E2E: install 6초, browser 설치 1분 7초, build 8초, E2E 57초 | Quality/E2E: `pnpm cache is not found`, Next build cache miss<br>Quality가 동일 pnpm 키 저장, E2E 저장은 동시 생성으로 충돌했으나 job은 성공 |
| 3    | [Quality job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34444582676/job/102766498626)<br>[E2E job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34444582659/job/102766498665)<br>커밋 `6511cdc91550e1a9045b1879ee8e9174d62f55de` |    Quality 57초<br>E2E 2분 38초 |    Quality 53초<br>E2E 2분 27초 | Quality: install 6초, test 8초, lint 8초, typecheck 2초, build 8초<br>E2E: install 5초, browser 설치 52초, build 8초, E2E 1분 10초  | Quality/E2E: `pnpm cache is not found`, Next build cache miss<br>Quality가 동일 pnpm 키 저장, E2E 저장은 동시 생성으로 충돌했으나 job은 성공 |

- Quality workflow 중앙값: 57초, 범위 50초~1분 6초
- Quality job 중앙값: 53초, 범위 47초~1분 3초
- E2E workflow 중앙값: 2분 38초, 범위 2분 6초~2분 49초
- E2E job 중앙값: 2분 27초, 범위 2분 3초~2분 46초

#### Warm

| 회차 | 커밋 / run URL                                                                                                                                                                                                                                                        |                workflow 전체 |                          job | 주요 step                                                                                                   | 캐시 증거                                                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------: | ---------------------------: | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [Quality job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34388626221/job/102591140674)<br>[E2E job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34388626456/job/102591141913)<br>커밋 `1c4d8e2ac4169022285e56f944ce492b42bc7625` |  Quality 57초<br>E2E 3분 4초 | Quality 54초<br>E2E 2분 24초 | Quality: test 11초, lint 10초, typecheck 3초, build 11초<br>E2E: browser 설치 51초, build 12초, E2E 57초    | pnpm cache hit/restored<br>key: `node-cache-Linux-x64-pnpm-4a4700f92bc4c477613076faf7033fe016210cf5d6a9cb6fb03827e2819d41f9`<br>약 197MB |
| 2    | [Quality job](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34389832684/job/102595119971)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34389832675)<br>커밋 `c4192a458aa3e9dfa187eec53bbca1763211645f`                  | Quality 55초<br>E2E 2분 33초 | Quality 53초<br>E2E 2분 30초 | Quality: test 11초, lint 10초, typecheck 3초, build 11초<br>E2E: browser 설치 57초, build 10초, E2E 1분 5초 | pnpm cache hit/restored<br>key: `node-cache-Linux-x64-pnpm-4a4700f92bc4c477613076faf7033fe016210cf5d6a9cb6fb03827e2819d41f9`<br>약 197MB |
| 3    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34390806195)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34390806199)<br>커밋 `8a6c4a6658176e4487cbe4eb1a4dc0cbd638d7db`                                   | Quality 53초<br>E2E 2분 10초 |  Quality 50초<br>E2E 2분 7초 | Quality: test 9초, lint 8초, typecheck 3초, build 9초<br>E2E: browser 설치 46초, build 8초, E2E 53초        | Quality/E2E: pnpm cache hit/restored, key 동일, 약 197MB                                                                                 |

- 원본 값: Quality/E2E warm 3회 모두 기록 완료
- Quality workflow 중앙값: 55초, 범위 53~57초
- Quality job 중앙값: 53초, 범위 50~54초
- E2E workflow 중앙값: 2분 33초, 범위 2분 10초~3분 4초
- E2E job 중앙값: 2분 24초, 범위 2분 7초~2분 30초
- 러너: Quality `eastus`, E2E `westcentralus`; 둘 다 Ubuntu 24.04.4 / `ubuntu-24.04` / image `20260831.293.1`

### 병목 판단

Before 반복 측정에서 가장 긴 구간은 E2E의 `Run E2E tests`였다. 중앙값은 warm 57초,
cold 57초이며, 다음으로 긴 `Install Playwright browsers`는 warm 51초, cold 52초였다.
pnpm 캐시 유무에 따른 install 시간 차이는 작았으며, Next build cache는 cold 3회 모두 miss였다.
개선 전 측정이므로 실제 단축량은 After 측정 전까지 확정하지 않는다.

## After

개선 적용 후 Before와 같은 검증 항목, 러너, Node 버전과 cold/warm 조건에서 각각 3회 측정한다.
Warm과 cold 모두 3회 측정을 완료했다. cold 2회차의 첫 시도는 캐시가 복원되어 집계에서 제외하고
재측정했다. 다만 아래 표의 캐시 증거 칸에 남은 대로, cold 3회의 캐시 miss 로그 원문은 아직
확인하지 않았다. 로그로 확인하기 전까지 이 3회를 cold로 확정하지 않는다.

### Cold

| 회차 | 커밋 / run URL                                                                                                                                                                                                                      |                         workflow 전체 |                                                              job | 주요 step                                                                                                                                                                                                      | 캐시 증거                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------: | ---------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34460080571)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34460080641)<br>커밋 `99ce7b9f81885ea0c6e249c3e6e991c41e26794e` |          Quality 58초<br>E2E 1분 57초 |             Quality 53초<br>Chromium 1분 39초<br>WebKit 1분 53초 | Quality: install 7초, test 9초, lint 7초, typecheck 3초, build 8초<br>E2E Chromium: install 4초, browser 설치 45초, build 7초, E2E 23초<br>E2E WebKit: install 6초, browser 설치 30초, build 8초, E2E 56초     | cold 실행 성공. cache miss 로그는 별도 확인 필요                                                                      |
| 2    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34461266607)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34461266531)<br>커밋 `e3cd5e23a1f7846bab48643490f98a6fc1bce44e` | Quality 약 1분 9초<br>E2E 약 3분 31초 | Quality 약 1분 5초<br>Chromium 약 1분 16초<br>WebKit 약 1분 38초 | Quality: install 6초, test 11초, lint 10초, typecheck 4초, build 9초<br>E2E Chromium: install 2초, browser 설치 22초, build 9초, E2E 25초<br>E2E WebKit: install 5초, browser 설치 33초, build 9초, E2E 37초   | 유효한 cold 재측정. setup-node 캐시 miss 여부는 로그 확인 필요. E2E workflow는 Chromium job 대기로 전체 시간이 늘어남 |
| 3    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34461971077)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34461971079)<br>커밋 `33737f611b6e53b7ad15b4b49460450896ca6c23` |       Quality 1분 9초<br>E2E 2분 20초 |          Quality 1분 6초<br>Chromium 1분 18초<br>WebKit 1분 42초 | Quality: install 6초, test 11초, lint 10초, typecheck 3초, build 10초<br>E2E Chromium: install 6초, browser 설치 27초, build 8초, E2E 21초<br>E2E WebKit: install 5초, browser 설치 30초, build 10초, E2E 40초 | 유효한 cold 실행. setup-node 캐시 miss 여부는 로그 확인 필요                                                          |

- Quality workflow 중앙값: 1분 9초, 범위 58초~1분 9초
- Quality job 중앙값: 1분 5초, 범위 53초~1분 6초
- E2E workflow 중앙값: 2분 20초, 범위 1분 57초~3분 31초
- E2E job 중앙값(느린 브라우저): 1분 42초, 범위 1분 38초~1분 53초

### Warm

| 회차 | 커밋 / run URL                                                                                                                                                                                                                      |                   workflow 전체 |                                                     job | 주요 step                                                                                                                                                                                                      | 캐시 증거                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------: | ------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34456469894)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34456469924)<br>커밋 `a9129272f963b1af19978e6ba2cf9d0f39375e4c` | Quality 1분 6초<br>E2E 1분 46초 | Quality 1분 3초<br>Chromium 1분 37초<br>WebKit 1분 44초 | Quality: install 2초, test 12초, lint 10초, typecheck 3초, build 10초<br>E2E Chromium: install 2초, browser 설치 38초, build 9초, E2E 24초<br>E2E WebKit: install 2초, browser 설치 35초, build 10초, E2E 39초 | warm 실행 성공. setup-node cache 로그는 별도 확인 필요 |
| 2    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34456907155)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34456907202)<br>커밋 `594a9e7c494faea86ad8a99f8d5c7a1f68030fbe` |    Quality 55초<br>E2E 1분 33초 |    Quality 52초<br>Chromium 1분 27초<br>WebKit 1분 24초 | Quality: install 2초, test 10초, lint 9초, typecheck 4초, build 10초<br>E2E Chromium: install 3초, browser 설치 38초, build 7초, E2E 21초<br>E2E WebKit: install 2초, browser 설치 34초, build 6초, E2E 27초   | warm 실행 성공. setup-node cache 로그는 별도 확인 필요 |
| 3    | [Quality run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34458232736)<br>[E2E run](https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34458232732)<br>커밋 `dac4d0e8aa87a3778a9bd23d0e60a2d9985241ed` |    Quality 57초<br>E2E 1분 54초 |    Quality 54초<br>Chromium 1분 21초<br>WebKit 1분 48초 | Quality: install 2초, test 11초, lint 9초, typecheck 4초, build 9초<br>E2E Chromium: install 2초, browser 설치 24초, build 10초, E2E 24초<br>E2E WebKit: install 2초, browser 설치 39초, build 10초, E2E 38초  | warm 실행 성공. setup-node cache 로그는 별도 확인 필요 |

- Quality workflow 중앙값: 57초, 범위 55~1분 6초
- E2E workflow 중앙값: 1분 46초, 범위 1분 33초~1분 54초
- E2E job 중앙값(느린 브라우저): 1분 37초, 범위 1분 37초~1분 44초

### Before와 비교

- 중앙값 변화: 미측정
- 범위 변화: 미측정
- 측정 흔들림보다 큰 변화인지: 미판단
- 지목한 병목의 감소와 연결되는지: 미판단

## 캐시

- warm 실행의 캐시 복원 로그: 기존 After 실행에서 확인한 증거를 회차별로 정리할 것
- 의도적인 캐시 miss 로그: Quality와 WebKit에서 `pnpm cache is not found` 확인
- hit install 시간: Chromium 2초
- miss install 시간: Quality 7초, WebKit 6초
- 캐시 키를 바꾸기 위해 사용한 lockfile 변경: 실행 완료(커밋 `91cabde25d6fc3144146541b354639b9a1c217e6`)
- 실험 Quality run: https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34466947559
- 실험 E2E run: https://github.com/im-wen3y/loop-pack-fe-l2-vol1/actions/runs/34466947550
- 실험 후 lockfile 복구: 완료(커밋 `8fe73a0b182bfa45c387f2982c4a4394da3cc60e`).
  `git diff 91cabde2~1 HEAD -- pnpm-lock.yaml package.json`이 비어 있어 실험 전 상태와 동일하다.

이번 실험은 matrix job이 동일한 새 cache key를 공유했다. 먼저 끝난 job이 캐시를 저장한 뒤
Chromium job이 시작되어 Chromium에서는 `Cache restored successfully`가 나타났다. 따라서 세 job
모두를 cold로 보지 않고, Quality·WebKit miss와 Chromium hit가 섞인 부분 cold 실험으로 분류한다.

캐시 hit/miss의 원본 로그와 install 시간을 함께 기록한다. miss는 frozen install이 실패하는 손상이
아니라 유효한 lockfile 변경으로 재현하고, 실험 변경은 측정 후 복구한다.

## 실행 조건

- 저비용 결정적 검증을 모든 PR에서 실행할지: 과제 요구사항에 따라 유지
- E2E 실행 조건: 미결정
- 스킵할 변경 범위: 미결정
- 스킵이 안전한 이유: 미작성
- 조건에 걸려 E2E가 실행된 PR과 로그: 미검증
- 조건에 걸리지 않아 E2E가 스킵된 PR과 로그: 미검증
- required check와 조건부 실행의 충돌: 미확인
- flaky 대응 정책과 근거: 미결정

E2E 실행 조건, 스킵 범위, required 배치와 flaky 정책은 작성자가 직접 판단한다.

## 예산

### 번들 예산

- 7주차 실제 전송 크기: 미확인
- 현재 값의 범위: 미측정
- 임계값과 여유폭: 미결정
- 임계값 근거: 미작성
- 예산 초과 PR의 빨간불: 미검증
- PR 화면의 측정값·한도·초과량 리포트: 미검증
- 수정 후 초록불 복구: 미검증

### 환경 변수 게이트

- 필수 환경 변수 목록: 미결정
- 누락 값 실패: 미검증
- 잘못된 URL 실패: 미검증
- 비공개 값의 `NEXT_PUBLIC_` 노출 실패: 미검증
- 실제 secret의 로그 비노출: 미검증

번들 임계값과 required 배치는 작성자가 실제 측정값과 리스크를 보고 직접 판단한다. Lighthouse CI는
선택이며, 도입하더라도 7주차 측정값과 변동성에 맞는 조건이 필요하다.

## AI 리뷰

### 리뷰 기준과 프롬프트

- 10주간 합의한 프로젝트 규칙을 담은 프롬프트: 미작성
- 현재 PR diff 리뷰: 미실행

### 판별 기록

- 잘 잡아낸 리뷰 1개와 채택 근거: 미확인
- 헛소리한 리뷰 1개와 기각 근거: 미확인
- 프롬프트 수정 전후와 변경 이유: 미작성

AI 리뷰의 CI 통합은 선택이며 로컬 도구로 진행해도 된다. AI는 리뷰 후보를 제시하지만, 채택과
기각은 작성자가 실제 diff와 팀 규칙을 대조해 판단한다. CI에 통합한다면 timeout, max turns,
concurrency, 명시적 트리거, 최소 권한과 secret 노출 방지를 추가로 검토한다.

## 규칙 승격

- 반복 지적의 출처: 미선정
- 결정적으로 참/거짓을 판별할 규칙: 미결정
- ESLint, `no-restricted-syntax` 또는 Danger 등 승격 수단: 미결정
- 위반 코드가 실패하는지: 미검증
- 정상 코드가 통과하는지: 미검증
- 오탐을 발견했을 때 규칙을 좁힌 기록: 미검증
- AI·사람에게 남길 것과 기계로 내릴 것에 대한 판단: 미작성

이미 존재하는 규칙을 이번 주에 새로 승격한 것으로 기록하지 않는다. 어떤 반복 지적을 승격할지는
작성자가 직접 결정한다.

## 질문 답변

각 답변은 작성자가 판단과 근거를 직접 정해 2~4문장으로 작성한다.

### 1. E2E를 모든 PR에 required로 걸면 어떤 문제가 생길까?

미작성

### 2. Lighthouse 점수 하락은 항상 merge blocker여야 할까?

미작성

### 3. Preview 환경이 production API를 바라보면 무슨 일이 생길까?

미작성

### 4. AI가 만든 workflow를 그대로 머지하면 어떤 리스크가 있을까?

미작성

### AI와 작성자의 역할

workflow와 `package.json`의 명령 연결, 시간 범위의 구분과 기록 틀은 AI와 함께 정리했다. GitHub
Actions 화면에서 각 step의 실제 시간을 확인한 것은 작성자다. 최종 병목, 적용할 개선 전략과 개선
효과는 반복 측정 결과를 본 뒤 작성자가 판단한다.
