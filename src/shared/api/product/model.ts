/* eslint-disable-next-line boundaries/dependencies */
import type { Category, CategoryId, Product, ProductSort } from '@/entities/product'

// URL 상태를 그대로 요청 파라미터로 쓴다. scenario는 여기에 포함하지 않는다.
export type GetProductListParams = {
  q?: string
  category?: CategoryId | 'all'
  sort?: ProductSort
  page?: number
  pageSize?: number
}

// 응답 봉투는 상품 도메인이 아니라 이 목록 화면의 조회 계약이라 조회하는 쪽이 소유한다.
export type GetProductListResponse = {
  products: Product[]
  categories: Category[]
  totalCount: number
  page: number
  pageSize: number
}
