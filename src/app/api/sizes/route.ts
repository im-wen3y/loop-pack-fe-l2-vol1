import { NextResponse } from 'next/server'
import type { SizeSelectOption } from '@/components/ui/select/SizeOptionSelect'

/*
 * mock 백엔드. 운동화/의류 같은 사이즈 옵션 상품의 데이터 — /api/products의 베이글과는
 * 다른 상품이라 같은 응답에 얹지 않고 리소스를 분리했다.
 * 응답 아이템 타입은 이미 SizeOptionSelect가 소유하고 있어(API 응답 = UI prop 형태가 동일)
 * 여기 새로 _types.ts를 만들어 중복 정의하지 않고 그 타입을 그대로 가져와 mock 데이터를
 * 검증한다 — products처럼 API 전용 타입이 따로 필요할 때만 _types.ts를 둔다.
 */
const sizes: SizeSelectOption[] = [
  { value: 24, stock: 3, deliveryText: '내일(토) 도착보장' },
  { value: 25, stock: 0 },
  { value: 26, stock: 12, deliveryText: '내일(토) 도착보장' },
  { value: 27, stock: 5, deliveryText: '내일(토) 도착보장' },
  { value: 28, stock: 0 },
]

export async function GET() {
  return NextResponse.json({ sizes })
}
