import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getProductList } from '@/api/products/api'
import type { GetProductListParams } from '@/api/products/model'

export const productQueryKeys = {
  all: ['product'] as const,
  list: (params: GetProductListParams) => [...productQueryKeys.all, 'list', params] as const,
}

export const productQuery = {
  list: (params: GetProductListParams) =>
    queryOptions({
      queryKey: productQueryKeys.list(params),
      queryFn: () => getProductList(params),
      // 페이지·검색 조건이 바뀌며 재조회되므로 이전 목록을 유지해 깜빡임을 막는다.
      placeholderData: keepPreviousData,
      // ponytail: 목록은 홈보다 자주 바뀐다. staleTime은 정책 값이니 필요하면 조정한다.
      staleTime: 60 * 1000,
    }),
}
