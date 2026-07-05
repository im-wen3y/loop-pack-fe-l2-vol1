import { useEffect, useRef } from 'react'
import { readFiltersFromUrl, type ProductFilters } from './useProductFilters'
import { readPageFromUrl } from './usePagination'

// 연속된 변화(예: 타이핑 중 매 keystroke)를 하나의 history entry로 묶는 간격.
// 이 시간 안에 다음 변화가 없어야 다음 변화부터 새 entry로 취급한다.
const BURST_SETTLE_MS = 300

// 필터·페이지 상태가 바뀔 때마다 기본값이 아닌 값만 URL 쿼리스트링에 반영하고,
// 뒤로가기/앞으로가기(popstate) 시에는 URL을 읽어 상태를 복원한다.
//
// 변화가 시작되는 시점에 "변경 전" URL을 그대로 한 번 push해 되돌아갈 자리를 남겨두고,
// 이후 값은 그 push된 entry를 replace하며 반영한다 — 그래야 뒤로가기가 실제 이전
// 필터·페이지로 돌아간다. 잠시 조용해지면(BURST_SETTLE_MS) 다음 변화부터 새 entry를 만든다.
export const useSyncFiltersToUrl = (
  filters: ProductFilters,
  page: number,
  restoreFilters: (filters: ProductFilters) => void,
  restorePage: (page: number) => void,
) => {
  const { category, searchQuery, sortBy, minPrice, maxPrice, inStockOnly } = filters
  const isBurstActiveRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (searchQuery) params.set('q', searchQuery)
    if (page > 1) params.set('page', String(page))
    if (sortBy !== 'latest') params.set('sort', sortBy)
    if (minPrice !== '') params.set('minPrice', String(minPrice))
    if (maxPrice !== '') params.set('maxPrice', String(maxPrice))
    if (inStockOnly) params.set('inStock', 'true')

    const nextQuery = params.toString()
    const currentQuery = new URLSearchParams(window.location.search).toString()
    // 이미 URL이 이 상태를 반영 중이면 아무 것도 하지 않는다.
    // (마운트 시 최초 동기화, popstate로 막 복원된 직후가 이 경로를 탄다)
    if (nextQuery === currentQuery) return

    if (!isBurstActiveRef.current) {
      // 변경 전 URL을 그대로 복제해 push — 이 entry가 "뒤로가기 시 돌아갈 이전 상태"가 된다.
      window.history.pushState(null, '', window.location.pathname + window.location.search)
      isBurstActiveRef.current = true
    }

    const search = nextQuery ? `?${nextQuery}` : window.location.pathname
    window.history.replaceState(null, '', search)

    const settleTimer = setTimeout(() => {
      isBurstActiveRef.current = false
    }, BURST_SETTLE_MS)

    return () => clearTimeout(settleTimer)
  }, [category, searchQuery, page, sortBy, minPrice, maxPrice, inStockOnly])

  useEffect(() => {
    const handlePopState = () => {
      isBurstActiveRef.current = false
      restoreFilters(readFiltersFromUrl())
      restorePage(readPageFromUrl())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [restoreFilters, restorePage])
}
