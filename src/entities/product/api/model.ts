import type { Category, CategoryId } from '@/entities/product/model/category'
import type { Product, ProductSort } from '@/entities/product/model/product'

// 상품 목록 엔드포인트의 요청 계약. 어떤 화면이 부르든 같은 파라미터를 받는다.
// URL 스키마(nuqs parser)는 화면이 소유하고, 여기서는 그 결과값만 받는다.
export type GetProductListParams = {
  q?: string
  category?: CategoryId | 'all'
  sort?: ProductSort
  page?: number
  pageSize?: number
}

// 페이지네이션 메타는 목록 엔드포인트 자체의 계약이라 상품 도메인이 소유한다.
// (홈처럼 여러 섹션을 조립한 화면 전용 응답은 그 화면이 소유한다 — _pages/home/api/model.ts)
export type GetProductListResponse = {
  products: Product[]
  categories: Category[]
  totalCount: number
  page: number
  pageSize: number
}
