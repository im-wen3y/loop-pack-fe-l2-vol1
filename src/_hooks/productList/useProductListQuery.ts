import type { GetProductListParams } from '../../_apis/product/model'
import type { Product } from '../../_types/product'
import { useGetProductList } from '../../_service/product/service'
import type { ProductFilters } from './useProductFilters'

const PAGE_SIZE = 12

type UseProductListQueryParams = {
  filters: ProductFilters
  page: number
}

// 필터·페이지 상태를 서버 요청 파라미터(GetProductListParams)로 조립해 목록을 조회하고,
// 컴포넌트가 바로 쓸 수 있는 형태(products·totalCount·totalPages·로딩/에러)로 되돌려준다.
// DTO 파라미터의 문자열 변환과 페이지 크기(PAGE_SIZE)를 이 훅이 흡수한다.
export const useProductListQuery = ({ filters, page }: UseProductListQueryParams) => {
  const { category, sortBy, searchQuery, minPrice, maxPrice, inStockOnly } = filters

  const queryParams: GetProductListParams = {
    category,
    sort: sortBy,
    q: searchQuery,
    page: String(page),
    size: String(PAGE_SIZE),
    ...(minPrice !== '' && { minPrice: String(minPrice) }),
    ...(maxPrice !== '' && { maxPrice: String(maxPrice) }),
    ...(inStockOnly && { inStock: 'true' }),
  }

  const { data, isLoading, isFetching, error } = useGetProductList(queryParams)

  const products: Product[] = data?.products ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return { products, totalCount, totalPages, isLoading, isFetching, error }
}
