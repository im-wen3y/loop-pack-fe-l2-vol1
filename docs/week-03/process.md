# Week 03 — 관심사 분리 & Custom Hook 과제 Spec

## 주제

`src/productList/ProductListPage.tsx` (단일 컴포넌트) → 3개 레이어로 분리

## 프로세스

1. 관심사 분류 — UI / 비즈니스 로직 / API / 상태를 훑고 표 작성 (`separation-checklist.md`)
2. 레이어 분리 — `components / hooks / services / utils` 구조로 정리, Custom Hook 3개 이상 추출
3. 분리 근거 기록 — 각 Hook이 한 문장으로 설명되는지 README에 작성
4. 셀프 리뷰 6단계 통과 → 결과 기록 (`self-review-result.md`)
5. PR — AI 생성 부분 표기, 분리마다 한 줄 근거

## 레이어 기준

| 레이어     | 위치          | 포함할 것                                        |
| ---------- | ------------- | ------------------------------------------------ |
| Components | `components/` | UI 렌더링만. JSX + 이벤트 바인딩                 |
| Hooks      | `hooks/`      | 상태·비즈니스 로직. 한 문장으로 설명 가능한 단위 |
| Services   | `services/`   | API 호출·endpoint·request/response 변환          |
| Utils      | `utils/`      | 순수 함수 (포맷, 계산 등)                        |

## 상태 3분할 기준

| 종류            | 설명                     | 관리 방법                            |
| --------------- | ------------------------ | ------------------------------------ |
| 서버 상태       | API에서 오는 데이터      | service + hook (추후 TanStack Query) |
| 클라이언트 상태 | UI 전용 (필터, 탭, 모달) | `useState`                           |
| 파생값          | 다른 상태에서 계산 가능  | `const` (state 금지)                 |

## 금물

- 분리 자체가 목적이 되지 않는다 — "이 분리가 무엇을 좋게 하나" 한 문장이 없으면 하지 않는다
- "큰 컴포넌트"가 "큰 Hook"으로 옮겨가지 않는다 — Hook도 단일 책임이다
- `useEffect`로 파생값을 동기화하지 않는다 — `const`로 계산한다
- Hook이 `fetch`·`axios` 구현체에 직접 묶이지 않는다 — service 함수에만 의존한다
- 타입·린트를 `any`·`@ts-ignore`·`eslint-disable`로 침묵시키지 않는다

---

## Checklist

### 관심사 분리

- [ ] JSX와 API 호출이 한 파일에 섞여 있지 않은가
- [ ] 비즈니스 로직(필터, 검색, 페이지네이션)이 Custom Hook으로 분리되었는가
- [ ] 포맷팅/유틸 함수가 `utils/`로 분리되었는가
- [ ] 컴포넌트는 UI 렌더링에만 집중하는가

### Custom Hook

- [ ] 이 Hook은 한 문장으로 설명되는가? ("그리고"가 두 번 들어가면 분리 후보)
- [ ] 같은 상태 + 로직 조합이 반복되는가
- [ ] JSX나 스타일을 반환하고 있지 않은가
- [ ] API 구현체(`axios`, `fetch`)에 너무 강하게 묶여 있지 않은가
- [ ] Hook을 너무 크게 만들어 컴포넌트의 복잡도를 그대로 옮기고 있지 않은가
- [ ] 각 Hook의 이름이 역할을 충분히 설명하는가 (`useData` ❌, `useProductFilter` ✅)

### API 레이어

- [ ] endpoint와 request/response 형태가 한 곳에 모여 있는가
- [ ] 컴포넌트가 서버 응답의 세부 구조를 너무 많이 알고 있지 않은가
- [ ] 서버 상태가 일관된 패턴으로 다뤄지고 있는가

### 프로세스

- [ ] 관심사 분류 표를 작성했는가 (`separation-checklist.md`)
- [ ] Custom Hook이 3개 이상인가
- [ ] 분리한 것·분리하지 않은 것 모두 README에 근거를 작성했는가
- [ ] 셀프 리뷰 6단계를 통과했는가
- [ ] PR에 AI 생성 부분을 표기했는가
- [ ] 분리마다 한 줄 근거를 PR에 남겼는가
