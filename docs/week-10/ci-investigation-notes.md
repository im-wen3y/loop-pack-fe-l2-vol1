# Week 10 CI 조사 기록

이 문서는 최종 RFC에 모두 담기 어려운 브라우저 설치 실패 이력과 대응 결과를 보관한다.
측정 조건과 Before 수치의 기준 문서는 [week10-ci.md](../rfc/week10-ci.md)다.

## 현재 최종 상태

2026-09-10 기준 workflow는 다음 상태로 고정되어 있다.

| workflow      | 검증 순서                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `quality.yml` | `pnpm test` → `pnpm lint` → `pnpm typecheck` → `pnpm build`                                             |
| `e2e.yml`     | `pnpm exec playwright install --with-deps chromium webkit` → `pnpm build` → `pnpm exec playwright test` |

- 두 job 모두 `ubuntu-latest`, `timeout-minutes: 10`, Node `24.17.0`, pnpm `10.15.1`을 사용한다.
- Quality에는 Playwright 브라우저 설치를 두지 않는다. `pnpm check`는 E2E를 실행하지 않기 때문이다.
- E2E에는 Chromium과 WebKit 실행에 필요한 OS 의존성을 포함해 설치한다.
- Google Chrome apt source를 삭제하거나 수정하는 별도 step은 최종 workflow에 포함하지 않는다.
- 기준 workflow 커밋은 `9859a7c6`이며, 측정 회차는 같은 파일 내용에서 빈 커밋으로 실행했다.

## 브라우저 설치 실패 이력

### 1. `--with-deps`에서 apt 저장소 해시 불일치

`pnpm exec playwright install --with-deps chromium webkit` 실행 중 Google Chrome apt 저장소의
`Packages.gz`가 Release 메타데이터의 해시와 달라지는 오류가 두 번 발생했다.

```text
E: Failed to fetch https://dl.google.com/linux/chrome-stable/deb/...
   Hash Sum mismatch
Error: Installation process exited with code: 100
```

이 오류는 Playwright 테스트 assertion이나 애플리케이션 코드에서 발생한 것이 아니라, runner가
시스템 의존성을 설치하는 과정에서 외부 apt 저장소 메타데이터를 일관되게 받지 못한 경우다.
따라서 해당 실행은 브라우저 설치 step에서 끝났고 Before 측정값에는 포함하지 않는다.

### 2. `--with-deps` 제거 실험

apt 갱신을 피하려고 다음 명령으로 바꿔 실행했다.

```bash
pnpm exec playwright install chromium webkit
```

Chromium 테스트는 진행됐지만 WebKit 실행 시 runner에 다음 라이브러리가 없어 실패했다.

```text
libgtk-4.so.1
libgraphene-1.0.so.0
libevent-2.1.so.7
libgstallocators-1.0.so.0
libgstaudio-1.0.so.0
libGLESv2.so.2
```

이 결과로 WebKit을 유지하는 현재 E2E 범위에서는 브라우저 바이너리 설치와 OS 의존성 설치를
분리할 수 없다는 사실을 확인했다.

### 3. Google Chrome apt source 삭제 실험

Google Chrome source 파일을 runner에서 삭제하는 임시 step도 확인했다. 이 방식은 apt 오류를
피할 수 있지만 runner 이미지의 source 파일 형식과 위치에 의존하고, 측정 workflow에 별도 runner
조작을 추가한다. 따라서 최종 workflow에서는 제거했다.

### 대응 결론

- 최종 명령은 `--with-deps`를 유지한다.
- apt 저장소의 일시적인 해시 불일치는 재실행으로 회복될 수 있지만, 최초 실패 로그를 남긴다.
- source 파일을 조작하는 우회는 최종 측정 조건에 포함하지 않는다.
- 최종 workflow에서는 브라우저 설치와 WebKit 실행이 모두 성공했다.

## Before warm 측정 결과

세 회차 모두 pnpm dependency cache의 동일한 key를 hit/restored했으며, cache 크기는 약 197MB였다.
Next.js build cache는 별도 캐시이므로 pnpm cache warm을 전체 캐시 warm으로 해석하지 않는다.

캐시 key:

```text
node-cache-Linux-x64-pnpm-4a4700f92bc4c477613076faf7033fe016210cf5d6a9cb6fb03827e2819d41f9
```

| 회차 | 커밋                                       | Quality workflow / job |  E2E workflow / job | 주요 step                                                                                            |
| ---- | ------------------------------------------ | ---------------------: | ------------------: | ---------------------------------------------------------------------------------------------------- |
| 1    | `1c4d8e2ac4169022285e56f944ce492b42bc7625` |            57초 / 54초 |  3분 4초 / 2분 24초 | Quality test 11초, lint 10초, typecheck 3초, build 11초 · E2E browser 51초, build 12초, test 57초    |
| 2    | `c4192a458aa3e9dfa187eec53bbca1763211645f` |            55초 / 53초 | 2분 33초 / 2분 30초 | Quality test 11초, lint 10초, typecheck 3초, build 11초 · E2E browser 57초, build 10초, test 1분 5초 |
| 3    | `8a6c4a6658176e4487cbe4eb1a4dc0cbd638d7db` |            53초 / 50초 |  2분 10초 / 2분 7초 | Quality test 9초, lint 8초, typecheck 3초, build 9초 · E2E browser 46초, build 8초, test 53초        |

실행 링크와 원본 로그는 [RFC의 Before 측정 기록](../rfc/week10-ci.md#측정-기록)에서 확인한다.

- Quality workflow 중앙값: 55초, 범위 53~57초
- Quality job 중앙값: 53초, 범위 50~54초
- E2E workflow 중앙값: 2분 33초, 범위 2분 10초~3분 4초
- E2E job 중앙값: 2분 24초, 범위 2분 7초~2분 30초
- 세 회차 모두 E2E의 `Run E2E tests`가 해당 job에서 가장 긴 구간이었다.

## 남은 측정과 판단

- Before cold 1~3회: 아직 미측정
- After cold/warm 각 3회: 아직 미측정
- 현재 Warm 결과만으로 최종 병목 개선량을 확정하지 않는다. Cold와 After를 같은 runner·Node·pnpm·검증
  구조에서 측정한 뒤 중앙값과 범위를 비교한다.
- 브라우저 설치 실패 재현 여부와 E2E 테스트 실패 여부를 분리해 기록한다. 설치 step에서 끝난
  실행은 테스트 결과가 없는 환경 실패로 분류한다.
