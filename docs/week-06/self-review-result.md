# 6주차 Self Review 결과

> `/self-review` 실행 결과 기록. `git diff origin/main...HEAD` 기준, `pnpm build`·`pnpm lint`·`pnpm test`·`pnpm exec tsc --noEmit` 실행.

**판정: PASS**

## 기능 완성도

- [x] RFC(RADIO) 작성 및 이동 전 커밋 — `docs/rfc/week06-fsd.md` (OK)
- [x] FSD 전환 + 기존 기능 보존 — `pnpm test` 47/47, 홈/목록 동작 diff 상 손실 없음 (OK)
- [x] 애매한 파일 5개 이상 후보 비교 — RFC 결정표 (OK)
- [x] Public API 결정 기록 — 각 슬라이스 `index.ts` + RFC/decisions.md 근거 (OK)
- [x] 에러 처리 경계 설계 + 검증 — 4단계 표, `RootErrorFallback` 실제 재현·복구 확인 완료 (OK)
- [x] 삭제 시나리오 자가 검증 — RFC 5단계 (OK)
- [x] Source of Truth 유지 — persist 키(`cart`/`wishlist`) 그대로, TanStack Query↔Zustand 복사 없음 (OK)
- [x] `pnpm check` 통과 — test/lint/typecheck/build 개별 실행 전부 통과 (OK)

## 정적 검사

- `pnpm build`: PASS
- `pnpm lint`: PASS
- `pnpm test`: PASS (47/47)
- `pnpm exec tsc --noEmit`: PASS

## 지적 사항 (심각도순)

- `[개선]` `src/entities/product/ui/product-option-select/*`, `src/shared/ui/select/useControlledSelect.ts` — `docs/week-06/decisions.md` #4 "최종 결정" 절에서 "select는 Dialog와 마찬가지로 소비처도 계획도 없는 상태로 남는다"고 스스로 확인했다. 그런데 이 문서가 세운 원래 원칙("배치를 정할 근거가 없다는 게 곧 이 코드의 자리가 없다는 뜻")을 그대로 적용하면 지금은 삭제 대상이다. 대체 근거(ProductFilters 교체)가 철회된 지금, 이 ~600줄을 남겨둘 근거가 문서상으로도 없다. 실제로 쓸 곳이 생기기 전까지는 다시 지우고 git 이력에서 꺼내는 쪽이 이 프로젝트가 반복적으로 세운 기준과 일관적이다.
- `[nit]` 위와 동일 범위 — `useControlledSelect.ts` 단위 테스트 없음. 소비처가 없어 급하지 않음.
