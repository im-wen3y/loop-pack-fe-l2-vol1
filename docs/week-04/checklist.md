# 4주차 체크리스트 — Next 세팅 & 하네스 이식 · Select(Headless) · Dialog(Compound)

> 기준: [`docs/assignments/week-04.md`](../assignments/week-04.md)

## 0단계 — Next 세팅 + 하네스 이식

- [x] `create-next-app`(TypeScript + App Router)으로 커머스 베이스를 **새로** 만들었는가 (기존 Vite 프로젝트를 옮긴 게 아님)
- [x] `create-next-app` 기본 ESLint를 그대로 두지 않고 1주차 flat config로 갈아끼웠는가 (`eslint.config.mjs`: next 룰 + `eslint-config-prettier` + `dist/**` 등 커스텀 ignore)
- [ ] Next 전용 룰(`@next/eslint-plugin-next` 등)을 넣은 근거를 설명할 수 있는가
- [x] husky pre-commit 게이트가 Next 프로젝트에서도 (lint-staged 등) 정상적으로 막는지 재검증했는가 (`.husky/pre-commit` + `lint-staged` 이식 완료, `pnpm lint` 통과 확인)

## 1단계 — Select (Headless)

> `src/components/ui/select/index.tsx` 아직 placeholder(`return null`)만 있음 — 미착수

- [ ] 라이브러리 없이 패턴 자체를 직접 구현했는가
- [ ] 네이티브 `<select>`를 감싸지 않고 `<div>`/`<ul>` 마크업으로 직접 만들었는가
- [ ] `value`가 문자열이 아니라 옵션 객체 전체인가 (`onChange`가 가격·배송 계산에 쓸 객체를 반환)
- [ ] 옵션 생김새는 사용처가 자유롭게 그리고, 로직은 상태(`selected`/`highlighted`/`disabled`)만 노출하는가
- [ ] 품절 옵션이 키보드 이동에서 건너뛰어지고 선택 불가능한가
- [ ] 키보드로 열기 · 이동(↑↓) · 선택(Enter) · 닫기(Esc)가 되는가
- [ ] 같은 로직으로 서로 다른 옵션 UI 3종(텍스트/사이즈/썸네일)을 렌더했는가 — 완료조건 이미지 3장 참고
- [ ] 위치 계산에 시간 쓰지 않았는가 (인라인 펼침 = CSS로 충분, 팝오버 필요 시 `@floating-ui/react`, popper 직접 구현 ✗)

## 2단계 — Dialog (Compound)

> `src/components/ui/dialog/index.tsx` 아직 placeholder(`return null`)만 있음 — 미착수

- [ ] `Dialog / Dialog.Trigger / Dialog.Overlay / Dialog.Content / Dialog.Title / Dialog.Description / Dialog.Close`로 compound 조립했는가
- [ ] controlled(`open`/`onOpenChange`)와 uncontrolled를 `open` prop 유무로 판별하는 이중 API로 둘 다 지원하는가
- [ ] `Dialog.Content`/`Overlay`를 Portal로 렌더했는가
- [ ] Esc / 오버레이 클릭으로 닫히는가
- [ ] 열려 있는 동안 배경 스크롤이 잠기는가
- [ ] 포커스 관리(트랩·복원·초기 포커스)·ARIA는 이번 주 범위 밖이니 시간 쓰지 않았는가

## 공통

- [ ] 변경마다 "왜 이렇게 설계했는가" 한 줄 근거를 남겼는가
- [ ] AI로 생성한 부분을 표기하고 직접 검토했는가
