import type { ChangeEvent } from 'react'
import type { SortBy, ViewMode } from '../../_types/product'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
]

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
