import { NextResponse } from 'next/server'

/*
 * mock 백엔드 (Next route handler). 실제 DB 대신 여기서 데이터를 내려준다.
 * 필요하면 자유롭게 늘리거나 구조를 바꿔도 된다.
 * ThumbnailOptionSelect 데모용 — 할인율(discountRate)/배지(badge)/묶음배지(bundleBadge)/
 * 재고(stock) 조합을 한 번에 보여주도록 구성했다. 품절은 boolean으로 내려주지 않고
 * stock === 0으로 프론트에서 판단한다(사이즈 옵션과 동일한 방식).
 */
const products = [
  {
    id: 'p1',
    name: '그로우턴 앰플 100ml기획(+100ml)',
    image: '/no-image.svg',
    price: 38800,
    discountRate: 2,
    badge: '오늘드림',
    stock: 15,
  },
  {
    id: 'p2',
    name: '그로우턴 앰플 130ml기획(+30ml)',
    image: '/no-image.svg',
    price: 33800,
    discountRate: 2,
    badge: '오늘드림',
    stock: 12,
  },
  {
    id: 'p3',
    name: '딸기요거트 45g(리뉴얼)',
    image: '/products/strawberry-yogurt.webp',
    price: 3900,
    badge: '오늘드림',
    bundleBadge: '1+1',
    stock: 5,
  },
  {
    id: 'p4',
    name: '멜론밀크 45g(리뉴얼)',
    image: '/products/melon-milk.webp',
    price: 3900,
    badge: '오늘드림',
    bundleBadge: '1+1',
    stock: 50,
  },
  {
    id: 'p5',
    name: '블루베리요거트 45g(리뉴얼)',
    image: '/products/blueberry-yogurt.webp',
    price: 3900,
    badge: '오늘드림',
    bundleBadge: '1+1',
    stock: 200,
  },
  {
    id: 'p6',
    name: '옥수수카스테라 45g',
    image: '/products/corn-castella.webp',
    price: 3900,
    bundleBadge: '1+1',
    stock: 0,
  },
]

export async function GET() {
  return NextResponse.json({ products, totalCount: products.length })
}
