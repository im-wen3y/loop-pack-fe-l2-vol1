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

type UseProductFiltersOptions = {
  // 필터가 바뀔 때마다 호출된다. (예: 페이지네이션을 1페이지로 되돌리기)
  onFilterChange: () => void
}

// 필터·검색·정렬 상태와 의미 기반 핸들러를 소유한다. 페이지 리셋 같은
// "필터가 바뀌면 벌어져야 할 일"은 onFilterChange 콜백으로 위임해 page를 직접 알지 않는다.
export const useProductFilters = ({ onFilterChange }: UseProductFiltersOptions) => {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [minPrice, setMinPrice] = useState<number | ''>('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState<SortBy>('latest')
  const [searchQuery, setSearchQuery] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  const handleCategoryChange = (nextCategory: CategoryFilter) => {
    setCategory(nextCategory)
    onFilterChange()
  }

  const handleMinPriceChange = (value: number | '') => {
    setMinPrice(value)
    onFilterChange()
  }

  const handleMaxPriceChange = (value: number | '') => {
    setMaxPrice(value)
    onFilterChange()
  }

  const handleSortChange = (sort: SortBy) => {
    setSortBy(sort)
    onFilterChange()
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onFilterChange()
  }

  const handleInStockToggle = (isInStockOnly: boolean) => {
    setInStockOnly(isInStockOnly)
    onFilterChange()
  }

  const handleResetFilters = () => {
    setCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('latest')
    setSearchQuery('')
    setInStockOnly(false)
    onFilterChange()
  }

  const filters: ProductFilters = {
    category,
    minPrice,
    maxPrice,
    sortBy,
    searchQuery,
    inStockOnly,
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
