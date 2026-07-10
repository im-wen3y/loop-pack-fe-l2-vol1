import { NextResponse } from 'next/server'
import type { TextSelectOption } from '@/components/ui/select/TextOptionSelect'

/*
 * mock 백엔드. 베이글 번들 구매 옵션 — /api/products의 상품들과는 다른 상품(별개 카탈로그)의
 * 데이터라서 같은 응답에 얹지 않고 리소스를 분리했다.
 * 응답 아이템 타입은 이미 TextOptionSelect가 소유하고 있어(API 응답 = UI prop 형태가 동일)
 * 여기 새로 _types.ts를 만들어 중복 정의하지 않고 그 타입을 그대로 가져와 mock 데이터를
 * 검증한다 — products처럼 API 전용 타입이 따로 필요할 때만 _types.ts를 둔다.
 */
const options: TextSelectOption[] = [
  {
    id: 'po1',
    label: '베이글 5+5개',
    isMaxDiscount: true,
    price: 21000,
    unitPrice: 2100,
    isFreeShipping: true,
    stock: 150,
  },
  {
    id: 'po2',
    label: '베이글 1개',
    isMaxDiscount: false,
    price: 4200,
    unitPrice: 4200,
    isFreeShipping: false,
    stock: 120,
  },
]

export async function GET() {
  return NextResponse.json({ options })
}
