import { NextResponse } from 'next/server'

/*
 * mock 백엔드. 베이글 번들 구매 옵션 — /api/products의 상품들과는 다른 상품(별개 카탈로그)의
 * 데이터라서 같은 응답에 얹지 않고 리소스를 분리했다.
 */
const options = [
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
