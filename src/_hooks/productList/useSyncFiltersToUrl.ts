import { useEffect } from 'react'
import type { ProductFilters } from './useProductFilters'

// 필터·페이지 상태가 바뀔 때마다 기본값이 아닌 값만 URL 쿼리스트링에 반영한다.
// (새로고침·공유 시 화면 상태가 복원되도록. 히스토리는 쌓지 않고 replace한다.)
export const useSyncFiltersToUrl = (filters: ProductFilters, page: number) => {
  const { category, searchQuery, sortBy, minPrice, maxPrice, inStockOnly } = filters

  useEffect(() => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (searchQuery) params.set('q', searchQuery)
    if (page > 1) params.set('page', String(page))
    if (sortBy !== 'latest') params.set('sort', sortBy)
    if (minPrice !== '') params.set('minPrice', String(minPrice))
    if (maxPrice !== '') params.set('maxPrice', String(maxPrice))
    if (inStockOnly) params.set('inStock', 'true')
    window.history.replaceState(null, '', `?${params.toString()}`)
  }, [category, searchQuery, page, sortBy, minPrice, maxPrice, inStockOnly])
}
