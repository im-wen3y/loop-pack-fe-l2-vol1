import type { GetProductListParams, GetProductListResponse } from '@/api/products/model'
import { serializeProductListQuery } from '@/api/products/searchParams'

export const getProductList = async (
  params: GetProductListParams,
): Promise<GetProductListResponse> => {
  const response = await fetch(`/api/products${serializeProductListQuery(params)}`)
  if (!response.ok) {
    throw new Error(`상품 목록을 불러오지 못했습니다 (status: ${response.status})`)
  }

  const data: GetProductListResponse = await response.json()
  return data
}
