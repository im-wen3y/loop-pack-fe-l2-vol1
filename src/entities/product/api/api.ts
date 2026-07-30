import type { GetProductListParams, GetProductListResponse } from './model'
import { serializeProductListQuery } from './query-schema'

export const getProductList = async (
  params: GetProductListParams,
): Promise<GetProductListResponse> => {
  const query = serializeProductListQuery(params)
  const response = await fetch(`/api/products${query}`)
  if (!response.ok) {
    throw new Error(`상품 목록을 불러오지 못했습니다 (status: ${response.status})`)
  }

  const data: GetProductListResponse = await response.json()
  return data
}
