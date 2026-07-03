import { useState } from 'react'
import type { CategoryFilter, SortBy } from '../../_types/product'

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

type UseProductFiltersOptions = {
  // 필터가 바뀔 때마다 호출된다. (예: 페이지네이션을 1페이지로 되돌리기)
  onFilterChange: () => void
}

// 필터·검색·정렬 상태와 의미 기반 핸들러를 소유한다. 페이지 리셋 같은
// "필터가 바뀌면 벌어져야 할 일"은 onFilterChange 콜백으로 위임해 page를 직접 알지 않는다.
export const useProductFilters = ({ onFilterChange }: UseProductFiltersOptions) => {
  const [filters, setFilters] = useState<ProductFilters>(INITIAL_FILTERS)

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

  return {
    filters,
    handleCategoryChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    handleSortChange,
    handleSearchChange,
    handleInStockToggle,
    handleResetFilters,
  }
}
