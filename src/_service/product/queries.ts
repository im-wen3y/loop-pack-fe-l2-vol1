import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { getProductList } from '../../_apis/product/api'
import type { GetProductListParams } from '../../_apis/product/model'

// service 계층 — api(`getProductList`)를 TanStack Query 옵션으로 감싼다.
//
// useSuspenseQuery가 아니라 useQuery를 쓰는 이유:
// ProductListPage는 필터·페이지가 바뀔 때 이전 목록을 화면에 남긴 채
// "데이터 갱신 중..." 인디케이터만 띄운다(전체 fallback은 최초 로드 때만).
// Suspense는 queryKey가 바뀔 때마다 다시 suspend되어 이 UX가 깨지므로,
// placeholderData: keepPreviousData로 이전 데이터를 유지하는 useQuery가 UI에 맞다.

export const productQueryKeys = {
  all: ['product'] as const,
  list: (query: GetProductListParams) => [...productQueryKeys.all, 'list', query] as const,
}

export const productQuery = {
  list: (query: GetProductListParams) =>
    queryOptions({
      queryKey: productQueryKeys.list(query),
      queryFn: () => getProductList(query),
      placeholderData: keepPreviousData,
    }),
}
