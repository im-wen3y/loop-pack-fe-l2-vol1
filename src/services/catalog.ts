import { headers } from 'next/headers'
import type { Product } from '@/app/api/products/_types'
import type { SizeSelectOption } from '@/components/ui/select/SizeOptionSelect'
import type { TextSelectOption } from '@/components/ui/select/TextOptionSelect'
import type { ThumbnailSelectOption } from '@/components/ui/select/ThumbnailOptionSelect'

/*
 * Server Component의 fetch는 브라우저처럼 현재 origin을 암묵적으로 붙여주지 않아서
 * 상대 경로('/api/...')를 그대로 넘기면 실패한다 — headers()로 요청받은 host를 읽어
 * 절대 URL을 직접 구성한다. res.ok가 아니면 그대로 throw해서 error.tsx가 받게 한다.
 * 소비처가 demo/select 페이지와 랜딩 페이지 프리뷰 2곳이 되어 여기로 옮겼다.
 */
const fetchApi = async <T>(path: string): Promise<T> => {
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = host?.startsWith('localhost') ? 'http' : 'https'
  const res = await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${path} 요청 실패 (${res.status})`)
  return res.json()
}

/*
 * 세 함수가 fetchApi<{...}>(path).then(data => data.x) 형태를 반복한다. 제네릭 헬퍼로
 * 더 묶을 수도 있지만, 리소스마다 응답 키 이름(products/sizes/options)이 달라 제네릭
 * 타이핑이 오히려 억지스러워지고, 소비처도 둘뿐이라 지금은 이득이 크지 않다.
 */
export const getProducts = () =>
  fetchApi<{ products: Product[] }>('/api/products').then((data) => data.products)

export const getSizes = () =>
  fetchApi<{ sizes: SizeSelectOption[] }>('/api/sizes').then((data) => data.sizes)

export const getPurchaseOptions = () =>
  fetchApi<{ options: TextSelectOption[] }>('/api/purchase-options').then((data) => data.options)

export const toThumbnailOptions = (products: Product[]): ThumbnailSelectOption[] =>
  products.map((product) => ({
    id: product.id,
    image: product.image,
    label: product.name,
    price: product.price,
    discountRate: product.discountRate,
    badge: product.badge,
    bundleBadge: product.bundleBadge,
    stock: product.stock,
  }))
