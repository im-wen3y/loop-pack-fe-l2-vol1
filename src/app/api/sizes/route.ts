import { NextResponse } from 'next/server'

/*
 * mock 백엔드. 운동화/의류 같은 사이즈 옵션 상품의 데이터 — /api/products의 베이글과는
 * 다른 상품이라 같은 응답에 얹지 않고 리소스를 분리했다.
 */
const sizes = [
  { value: 24, stock: 3, deliveryText: '내일(토) 도착보장' },
  { value: 25, stock: 0 },
  { value: 26, stock: 12, deliveryText: '내일(토) 도착보장' },
  { value: 27, stock: 5, deliveryText: '내일(토) 도착보장' },
  { value: 28, stock: 0 },
]

export async function GET() {
  return NextResponse.json({ sizes })
}
