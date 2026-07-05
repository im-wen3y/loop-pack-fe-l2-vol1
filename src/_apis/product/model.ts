import type { Product } from '../../_types/product'

export type GetProductListParams = {
  category: string
  sort: string
  q: string
  page: string
  size: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
}

export type GetProductListResponse = {
  products: Product[]
  totalCount: number
}
