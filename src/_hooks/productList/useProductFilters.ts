import { useState } from 'react'
import {
  CATEGORY_FILTER_VALUES,
  SORT_BY_VALUES,
  type CategoryFilter,
  type SortBy,
} from '../../_types/product'

// 목록을 좁히는 조건 묶음. 페이지 상태는 포함하지 않는다.
export type ProductFilters = {
  category: CategoryFilter
  minPrice: number | ''
  maxPrice: number | ''
  sortBy: SortBy
  searchQuery: string
  inStockOnly: boolean
}

const INITIAL_FILTERS: ProductFilters = {
  category: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'latest',
  searchQuery: '',
  inStockOnly: false,
}

// 유효한 카테고리·정렬 값은 SearchFilter.tsx·SearchSort.tsx의 옵션 목록과 같은 출처(_types/product.ts)를 쓴다.
const CATEGORY_VALUE_SET = new Set<string>(CATEGORY_FILTER_VALUES)
const SORT_VALUE_SET = new Set<string>(SORT_BY_VALUES)

const isCategoryFilter = (value: string | null): value is CategoryFilter =>
  value !== null && CATEGORY_VALUE_SET.has(value)

const isSortBy = (value: string | null): value is SortBy =>
  value !== null && SORT_VALUE_SET.has(value)

const parsePriceParam = (value: string | null): number | '' => {
  if (value === null) return ''
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : ''
}

// 마운트 시 초기값 복원, 뒤로가기 시 popstate 복원 양쪽에서 재사용한다.
// useSyncFiltersToUrl이 같은 키로 기록해두므로 라우터 없이 URLSearchParams 왕복만으로 충분하다.
export function readFiltersFromUrl(): ProductFilters {
  const params = new URLSearchParams(window.location.search)
  const category = params.get('category')
  const sortBy = params.get('sort')

  return {
    category: isCategoryFilter(category) ? category : INITIAL_FILTERS.category,
    searchQuery: params.get('q') ?? INITIAL_FILTERS.searchQuery,
    sortBy: isSortBy(sortBy) ? sortBy : INITIAL_FILTERS.sortBy,
    minPrice: parsePriceParam(params.get('minPrice')),
    maxPrice: parsePriceParam(params.get('maxPrice')),
    inStockOnly: params.get('inStock') === 'true',
  }
}

type UseProductFiltersOptions = {
  // 필터가 바뀔 때마다 호출된다. (예: 페이지네이션을 1페이지로 되돌리기)
  onFilterChange: () => void
}

// 필터·검색·정렬 상태와 의미 기반 핸들러를 소유한다. 페이지 리셋 같은
// "필터가 바뀌면 벌어져야 할 일"은 onFilterChange 콜백으로 위임해 page를 직접 알지 않는다.
export const useProductFilters = ({ onFilterChange }: UseProductFiltersOptions) => {
  const [filters, setFilters] = useState<ProductFilters>(readFiltersFromUrl)

  const updateFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    onFilterChange()
  }

  const handleCategoryChange = (nextCategory: CategoryFilter) =>
    updateFilter('category', nextCategory)

  const handleMinPriceChange = (value: number | '') => updateFilter('minPrice', value)

  const handleMaxPriceChange = (value: number | '') => updateFilter('maxPrice', value)

  const handleSortChange = (sort: SortBy) => updateFilter('sortBy', sort)

  const handleSearchChange = (query: string) => updateFilter('searchQuery', query)

  const handleInStockToggle = (isInStockOnly: boolean) => updateFilter('inStockOnly', isInStockOnly)

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
    onFilterChange()
  }

  // 뒤로가기(popstate) 시 URL에서 읽은 필터를 그대로 되돌리기 위한 용도.
  // 페이지를 1로 리셋하는 onFilterChange를 거치지 않는다 — 복원 시 page는 URL 값을 따라야 한다.
  const replaceFilters = (next: ProductFilters) => setFilters(next)

  return {
    filters,
    handleCategoryChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    handleSortChange,
    handleSearchChange,
    handleInStockToggle,
    handleResetFilters,
    replaceFilters,
  }
}
