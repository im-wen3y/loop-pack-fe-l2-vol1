# RFC Week 06 실행 절차

현재 상태와 완료 여부의 단일 기준은 [`week06-fsd.md`의 `남은 이슈와 최종 검증`](../rfc/week06-fsd.md#남은-이슈와-최종-검증) 표다. 이 문서는 표의 `R1`~~`R4`, `V1`~~`V3`을 처리할 때 필요한 순서만 설명한다.

작업이 끝나면 이 문서에 완료 표시를 남기지 않고 RFC의 상태·근거·검증 결과를 갱신한다.

## R1. 홈 Route Handler 응답 타입 소유권

1. mock Route Handler를 화면 계약의 adapter로 볼지 독립된 mock 백엔드로 볼지 결정한다.
2. adapter로 본다면 `_pages/home` 내부 타입 참조를 허용하는 이유와 예외 범위를 RFC에 기록한다.
3. 독립된 mock 백엔드로 본다면 `app/api` 내부 응답 타입을 정의하고 `_pages/home/api/model`과 구조가 일치하는지 타입으로 검증한다.
4. 최종 import가 프로젝트의 Public API 원칙과 일치하는지 `pnpm lint`와 `pnpm typecheck`로 확인한다.

## R2. 홈 에러 화면 재시도

M2 기준선을 먼저 확인한 뒤 수정한다. 먼저 수정하면 기존 버그의 재현 결과가 사라진다.

1. 홈 API에 `scenario=error`를 임시로 추가하고 루트 fallback 노출을 확인한다.
2. `다시 시도` 클릭 시 `/api/home` 요청이 새로 발생하지 않는지 확인한다.
3. `RootErrorFallback.tsx`에서 TanStack Query의 `useQueryErrorResetBoundary` reset과 App Router reset을 함께 호출한다.
4. 새 요청 발생과 정상 상태 복구를 확인하고 임시 `scenario`를 제거한다.
5. RFC `R2`, 기존 버그 표, 실패 재현 결과를 갱신하고 구조 변경과 별도 `fix:` 커밋으로 처리한다.

## R3. 상품 목록 HTTP 오류 경계

1. HTTP status 대신 화면 의존도로 경계를 나누는 현재 기준을 유지할지, 4xx·5xx 기준을 도입할지 확정한다.
2. status 분기가 필요하면 네트워크 오류와 HTTP 오류를 구분하는 에러 타입을 정의한다.
3. `getProductList`가 status를 보존하도록 바꾸고 queryOptions의 `throwOnError` 기준을 에러 처리 표와 맞춘다.
4. 에러 변환과 분기는 Vitest로 검증한다.
5. 브라우저에서는 필터 유지, 대표 오류 UI, 전체 새로고침 없는 복구처럼 사용자 경계만 Playwright로 확인한다.

## R4. Zustand 단위 테스트

1. `createCollectionStore`의 추가·제거 상태 전이와 중복·빈 상태 경계값을 Vitest로 검증한다.
2. cart·wishlist 소비에 사용하는 `ids.includes`, `ids.length`, action selector의 결과를 검증한다.
3. persist 복원과 손상값 복구 중 브라우저 없이 확인 가능한 로직을 단위 테스트로 옮긴다.
4. E2E에는 홈과 목록 사이의 동기화, 새로고침 후 복원처럼 실제 브라우저 경계만 남긴다.
5. RFC의 Test Files·Tests 개수를 새 기준값으로 갱신한다.

## V1. 최종 자동 검증

1. `pnpm test`, `pnpm lint`, `pnpm typecheck`를 실행한다.
2. `pnpm build`에서 `hydration-demo` 삭제를 반영한 라우트 5개와 동적·정적 구분을 확인한다.
3. 마지막에 `pnpm check`를 실행하고 RFC 자동 검증 표를 갱신한다.

## V2. 핵심 Playwright E2E

1. Chromium·WebKit에서 핵심 사용자 흐름을 실행한다.
2. WebKit의 `debounce 대기 중 페이지를 떠나면…` 테스트가 실패하면 단독 `--repeat-each=3`으로 기존 플레이키와 비교한다.
3. 통과 개수뿐 아니라 실패 테스트 이름과 회귀 여부를 RFC에 기록한다.

## V3. 수동 M1–M9와 layout shift

1. RFC의 수동 검증 표 순서대로 실제 관찰값을 확인한다.
2. M5에서는 필터·카드 스켈레톤과 실제 콘텐츠의 높이·간격·반응형 배치를 비교한다.
3. 로딩 완료 전후 결과 영역이 밀리는 layout shift가 없는지 확인한다.
4. 문자열과 URL을 포함한 실제 관찰값이 기대와 일치할 때만 RFC 표를 완료 처리한다.
