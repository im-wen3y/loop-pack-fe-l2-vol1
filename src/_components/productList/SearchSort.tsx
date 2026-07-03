import type { ChangeEvent } from 'react'
import { SORT_BY_VALUES, type SortBy, type ViewMode } from '../../_types/product'

const SORT_LABELS: Record<SortBy, string> = {
  'latest': '최신순',
  'popular': '인기순',
  'price-asc': '가격 낮은순',
  'price-desc': '가격 높은순',
}

const SORT_OPTIONS = SORT_BY_VALUES.map((value) => ({ value, label: SORT_LABELS[value] }))

type SearchSortProps = {
  searchQuery: string
  sortBy: SortBy
  viewMode: ViewMode
  onSearchChange: (query: string) => void
  onSortChange: (sort: SortBy) => void
  onViewModeChange: (viewMode: ViewMode) => void
}

export const SearchSort = ({
  searchQuery,
  sortBy,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewModeChange,
}: SearchSortProps) => {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) =>
    onSortChange(e.target.value as SortBy)

  const handleViewModeChange = (e: ChangeEvent<HTMLSelectElement>) =>
    onViewModeChange(e.target.value as ViewMode)

  return (
    <section className="search-sort">
      <input
        type="search"
        placeholder="상품 검색..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input"
      />
      <select value={sortBy} onChange={handleSortChange}>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select value={viewMode} onChange={handleViewModeChange}>
        <option value="grid">그리드</option>
        <option value="list">리스트</option>
      </select>
    </section>
  )
}
