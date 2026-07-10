import { headers } from 'next/headers'
import type { Product } from '@/app/api/products/_types'
import { TextOptionSelect, type TextSelectOption } from '@/components/ui/select/TextOptionSelect'
import { SizeOptionSelect, type SizeSelectOption } from '@/components/ui/select/SizeOptionSelect'
import {
  ThumbnailOptionSelect,
  type ThumbnailSelectOption,
} from '@/components/ui/select/ThumbnailOptionSelect'
import { PreviewCard } from './PreviewCard'

/*
 * fetchApi/getX/toThumbnailOptions는 이 컴포넌트 하나만 쓴다 — 소비처가 한 곳뿐이라
 * 별도 서비스 파일(src/services/catalog.ts)·유틸 파일로 분리하지 않고 여기 인라인한다.
 * 두 번째 소비처(상품 상세, 장바구니 등)가 생기면 그때 다시 분리를 고려한다.
 * 컴포넌트(SelectPreview)와 구분되게, 아래 유틸 함수들은 code-style.md 컨벤션대로
 * const 화살표 대신 function 선언을 쓴다.
 */

/*
 * Server Component의 fetch는 브라우저처럼 현재 origin을 암묵적으로 붙여주지 않아서
 * 상대 경로('/api/...')를 그대로 넘기면 실패한다 — headers()로 요청받은 host를 읽어
 * 절대 URL을 직접 구성한다. res.ok가 아니면 그대로 throw한다 — 아래 SelectPreview를 감싸는
 * SelectPreviewBoundary가 이 throw를, 그 외 예기치 못한 에러는 루트 error.tsx가 받는다.
 */
async function fetchApi<T>(path: string): Promise<T> {
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = host?.startsWith('localhost') ? 'http' : 'https'
  // mock 데이터라 캐싱 전략이 필요 없다 — 나중에 필요해지면 이 옵션이 유일한 튜닝 지점이다.
  const res = await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${path} 요청 실패 (${res.status})`)
  return res.json()
}

/*
 * 세 함수가 fetchApi<{...}>(path).then(data => data.x) 형태를 반복한다. 제네릭 헬퍼로
 * 더 묶을 수도 있지만, 리소스마다 응답 키 이름(products/sizes/options)이 달라 제네릭
 * 타이핑이 오히려 억지스러워지고, 소비처도 이 컴포넌트 하나뿐이라 지금은 이득이 크지 않다.
 */
function getProducts() {
  return fetchApi<{ products: Product[] }>('/api/products').then((data) => data.products)
}

function getSizes() {
  return fetchApi<{ sizes: SizeSelectOption[] }>('/api/sizes').then((data) => data.sizes)
}

function getPurchaseOptions() {
  return fetchApi<{ options: TextSelectOption[] }>('/api/purchase-options').then(
    (data) => data.options,
  )
}

// Product(API 도메인 타입)의 name을 ThumbnailSelectOption(UI prop 타입)의 label로 바꾸는 것 외엔 그대로 통과.
function toThumbnailOptions(products: Product[]): ThumbnailSelectOption[] {
  return products.map((product) => ({
    id: product.id,
    image: product.image,
    label: product.name,
    price: product.price,
    discountRate: product.discountRate,
    badge: product.badge,
    bundleBadge: product.bundleBadge,
    stock: product.stock,
  }))
}

export const SelectPreview = async () => {
  const [products, sizeOptions, textOptions] = await Promise.all([
    getProducts(),
    getSizes(),
    getPurchaseOptions(),
  ])
  const thumbnailOptions = toThumbnailOptions(products)

  return (
    <>
      <PreviewCard title="TextOptionSelect" description="이름·총액·1개당 단가·배지 조합, 품절 스킵">
        <TextOptionSelect title="옵션 선택" options={textOptions} />
      </PreviewCard>
      <PreviewCard title="SizeOptionSelect" description="재고(stock) 기반 품절 판정, 배송 문구">
        <SizeOptionSelect title="사이즈" options={sizeOptions} />
      </PreviewCard>
      <PreviewCard title="ThumbnailOptionSelect" description="썸네일 + 할인율/배지/묶음배지 조합">
        <ThumbnailOptionSelect title="옵션을 선택해 주세요" options={thumbnailOptions} />
      </PreviewCard>
    </>
  )
}
