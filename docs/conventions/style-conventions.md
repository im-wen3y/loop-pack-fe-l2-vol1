# 스타일 컨벤션 (Tailwind CSS v4 + Vite)

참고: [Tailwind CSS — Using Vite](https://tailwindcss.com/docs/installation/using-vite)

## 설정

`vite.config.ts`에 `@tailwindcss/vite` 플러그인 등록:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

진입 CSS 파일에 한 줄만 추가:

```css
@import "tailwindcss";
```

별도 `tailwind.config.js` 파일 불필요 (v4부터 CSS 파일 내 `@theme`으로 관리).

## v4 주요 변경 사항 (v3 대비)

### 새 유틸리티·변형

- `inset-shadow-*`, `inset-ring-*`: 내부 그림자·링
- `field-sizing-content`: textarea 자동 높이
- `not-*`: `:not()` 선택자 변형
- `in-*`: 부모 상태 기반 스타일링 (`group` 대체 가능)
- `@starting-style`: 진입 애니메이션

### 제거·변경된 것

- `@apply` 사용 가능하나 권장하지 않음 — 유틸리티 클래스 직접 사용 우선
- `theme()` 함수 대신 CSS 변수(`var(--color-brand)`) 사용
- `@tailwind base/components/utilities` → `@import "tailwindcss"` 한 줄로 대체
- `darkMode: 'class'` 설정 → `@custom-variant dark (&:where(.dark, .dark *));`로 대체

## 클래스 작성 규칙

- Tailwind 유틸리티 클래스를 기본으로 사용
- 클래스가 길어질 경우 가독성 기준으로 줄바꿈 허용 (JSX 속성 단위)
- 동적 클래스 조합은 `clsx` 또는 `tailwind-merge` 사용

```tsx
// 권장
<button
  className={clsx(
    'rounded px-4 py-2 text-sm font-medium',
    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700',
  )}
/>

// 금지 — 조건부 클래스를 문자열 보간으로 처리
<button className={`btn ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`} />
```

- Tailwind가 정적 분석으로 클래스를 감지하므로 **동적으로 클래스명을 조립하지 않을 것**

```tsx
// 금지 — 빌드 시 클래스가 번들에 포함되지 않음
const color = 'blue'
<div className={`text-${color}-600`} />

// 권장
const className = isBlue ? 'text-blue-600' : 'text-red-600'
<div className={className} />
```

## 커스텀 토큰 (테마 확장)

전역 CSS 파일에서 `@theme`으로 디자인 토큰 정의:

```css
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --font-sans: 'Pretendard', sans-serif;
  --spacing-18: 4.5rem;
}
```

정의된 토큰은 `text-brand`, `font-sans`, `mt-18` 등으로 사용 가능.

## 컴포넌트 스타일 범위

- 컴포넌트 고유 스타일이 필요한 경우 CSS Modules(`.module.css`) 사용
- 전역 스타일은 `app/` 레이어 진입 CSS 파일에서만 작성
- Tailwind 유틸리티로 표현 불가한 복잡한 애니메이션·레이아웃에만 CSS Modules 허용

## 반응형

- 모바일 우선(`sm:`, `md:`, `lg:`) 순서로 작성
- 브레이크포인트 접두사는 클래스 앞에 붙이고 일관된 순서 유지

```tsx
<div className="w-full md:w-1/2 lg:w-1/3" />
```

## 다크모드

- `dark:` 변형 사용
- 다크모드 전환 방식은 `@theme`의 `--default-color-scheme` 또는 CSS 클래스 기반으로 통일

```tsx
<p className="text-gray-900 dark:text-gray-100" />
```

## 자주 쓰는 패턴

### 레이아웃

```tsx
// 중앙 정렬 컨테이너
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

// Flexbox 중앙
<div className="flex items-center justify-center" />

// Grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" />
```

### 트랜지션

```tsx
<div className="transition-colors duration-200 hover:bg-gray-100" />
```

### 스크롤 영역

```tsx
<div className="overflow-y-auto scrollbar-thin" />
```
