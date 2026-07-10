/*
 * route.ts의 mock 응답 아이템 타입. src/app/_components/SelectPreview.tsx가 이 타입을
 * 그대로 재사용한다 — 예전엔 소비처 쪽에 이 구조를 손으로 재선언해서 route가 바뀌어도
 * 타입이 안 맞는 걸 컴파일러가 못 잡았다. code-style.md의 "동일한 도메인 값은 타입과 함께
 * 한 곳(_types 등)에 정의" 규칙을 이 저장소에서 처음 실제로 적용한 사례다.
 */
export type Product = {
  id: string
  name: string
  image: string
  price: number
  discountRate?: number
  badge?: string
  bundleBadge?: string
  stock: number
}
