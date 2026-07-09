# 4주차 체크리스트 — Next 세팅 & 하네스 이식 · Select(Headless) · Dialog(Compound)

> 기준: [`docs/assignments/week-04.md`](../assignments/week-04.md)

## 0단계 — Next 세팅 + 하네스 이식

- [x] `create-next-app`(TypeScript + App Router)으로 커머스 베이스를 **새로** 만들었는가 (기존 Vite 프로젝트를 옮긴 게 아님)
- [x] `create-next-app` 기본 ESLint를 그대로 두지 않고 1주차 flat config로 갈아끼웠는가 (`eslint.config.mjs`: next 룰 + `eslint-config-prettier` + `dist/**` 등 커스텀 ignore)
- [ ] Next 전용 룰(`@next/eslint-plugin-next` 등)을 넣은 근거를 설명할 수 있는가
- [x] husky pre-commit 게이트가 Next 프로젝트에서도 (lint-staged 등) 정상적으로 막는지 재검증했는가 (`.husky/pre-commit` + `lint-staged` 이식 완료, `pnpm lint` 통과 확인)

## 1단계 — Select (Headless)

> `src/hooks/useSelect.ts` + `TextOptionSelect`/`SizeOptionSelect`/`ThumbnailOptionSelect` 구현 완료, `/demo/select`에서 3종 전부 확인 가능

- [x] 라이브러리 없이 패턴 자체를 직접 구현했는가 (`src/hooks/useSelect.ts` — 외부 select/listbox 라이브러리 없이 직접 구현)
- [x] 네이티브 `<select>`를 감싸지 않고 `<div>`/`<ul>` 마크업으로 직접 만들었는가 (3개 컴포넌트 전부 `<div>` + `<ul role="listbox">` + `<li role="option">`)
- [x] `value`가 문자열이 아니라 옵션 객체 전체인가 (`TextSelectOption`/`SizeSelectOption`/`ThumbnailSelectOption` 전체 객체를 `onChange`로 반환 — 선택 해제 시엔 `undefined`)
- [x] 옵션 생김새는 사용처가 자유롭게 그리고, 로직은 상태(`selected`/`highlighted`/`disabled`)만 노출하는가 (훅은 `selectedIndex`/`highlightedIndex`/`isOpen`만 반환, 3개 컴포넌트의 마크업·CSS는 서로 완전히 독립)
- [x] 품절 옵션이 키보드 이동에서 건너뛰어지고 선택 불가능한가 (`isOptionDisabled` + `stepToEnabled`; Playwright로 ArrowDown 스킵·클릭 무시 실제 검증)
- [x] 키보드로 열기 · 이동(↑↓) · 선택(Enter) · 닫기(Esc)가 되는가 (`onKeyDown` + `onTriggerClick` — Safari/WebKit에서 클릭 후 키보드가 안 먹던 포커스 버그까지 Playwright로 잡아서 수정)
- [x] 같은 로직으로 서로 다른 옵션 UI 3종(텍스트/사이즈/썸네일)을 렌더했는가 — 완료조건 이미지 3장 참고 (`/demo/select`)
- [x] 위치 계산에 시간 쓰지 않았는가 (인라인 펼침 = CSS로 충분, 팝오버 필요 시 `@floating-ui/react`, popper 직접 구현 ✗) — 3종 모두 팝오버 불필요로 판단해 `@floating-ui/react` 미도입

## 2단계 — Dialog (Compound)

> `src/components/ui/dialog/index.tsx` 아직 placeholder(`return null`)만 있음 — 미착수

- [ ] `Dialog / Dialog.Trigger / Dialog.Overlay / Dialog.Content / Dialog.Title / Dialog.Description / Dialog.Close`로 compound 조립했는가
- [ ] controlled(`open`/`onOpenChange`)와 uncontrolled를 `open` prop 유무로 판별하는 이중 API로 둘 다 지원하는가
- [ ] `Dialog.Content`/`Overlay`를 Portal로 렌더했는가
- [ ] Esc / 오버레이 클릭으로 닫히는가
- [ ] 열려 있는 동안 배경 스크롤이 잠기는가
- [ ] 포커스 관리(트랩·복원·초기 포커스)·ARIA는 이번 주 범위 밖이니 시간 쓰지 않았는가

## 공통

- [ ] 변경마다 "왜 이렇게 설계했는가" 한 줄 근거를 남겼는가 (일부는 코드 주석으로 남아있음 — WebKit 포커스 버그 수정, `ThumbnailOptionSelect`의 `aria-disabled` 예외 처리, `next/image` `unoptimized` 사유 등. 커밋 단위로 근거를 정리하는 건 아직 안 함)
- [ ] AI로 생성한 부분을 표기하고 직접 검토했는가 (PR 본문에 AI 생성 부분 표기 아직 안 함 — PR 작성 시 처리 필요)

## AI 작성 표기

이 체크리스트의 1단계(Select) 항목 체크와 근거 메모는 AI(Claude)가 세션 동안 실제로 구현·검증한 내용을 바탕으로 갱신했습니다. 어떤 항목을 검증 완료로 볼지, 공통 항목을 왜 아직 미완료로 남겨뒀는지는 AI가 판단해 작성했고, 사용자가 검토합니다.
