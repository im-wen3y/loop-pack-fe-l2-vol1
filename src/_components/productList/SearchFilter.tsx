import type { ChangeEvent } from 'react'
import { CATEGORY_FILTER_VALUES, type CategoryFilter } from '../../_types/product'
import type { ProductFilters } from '../../_hooks/productList/useProductFilters'

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: '전체',
  electronics: '전자제품',
  fashion: '패션',
  home: '홈',
  beauty: '뷰티',
}

const CATEGORIES = CATEGORY_FILTER_VALUES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))

type SearchFilterValues = Pick<ProductFilters, 'category' | 'minPrice' | 'maxPrice' | 'inStockOnly'>

type SearchFilterHandlers = {
  onCategoryChange: (category: CategoryFilter) => void
  onMinPriceChange: (value: number | '') => void
  onMaxPriceChange: (value: number | '') => void
  onInStockOnlyChange: (isInStockOnly: boolean) => void
}

type SearchFilterProps = {
  filters: SearchFilterValues
  onFilterChange: SearchFilterHandlers
  onResetFilters: () => void
}

const parsePrice = (value: string): number | '' => (value === '' ? '' : Number(value))

export const SearchFilter = ({ filters, onFilterChange, onResetFilters }: SearchFilterProps) => {
  const { category, minPrice, maxPrice, inStockOnly } = filters
  const { onCategoryChange, onMinPriceChange, onMaxPriceChange, onInStockOnlyChange } =
    onFilterChange

  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    onMinPriceChange(parsePrice(e.target.value))

  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    onMaxPriceChange(parsePrice(e.target.value))

  const handleInStockOnlyChange = (e: ChangeEvent<HTMLInputElement>) =>
    onInStockOnlyChange(e.target.checked)

  return (
    <section className="filter-panel">
      <div className="filter-group">
        <label>카테고리</label>
        <div className="category-list">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={category === cat.value ? 'active' : ''}
              onClick={() => onCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>가격 범위</label>
        <div className="price-range">
          <input
            type="number"
            placeholder="최소"
            value={minPrice}
            onChange={handleMinPriceChange}
            min={0}
          />
          <span>~</span>
          <input
            type="number"
            placeholder="최대"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            min={0}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>옵션</label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 400,
            fontSize: 13,
          }}
        >
          <input type="checkbox" checked={inStockOnly} onChange={handleInStockOnlyChange} />
          재고 있는 것만
        </label>
      </div>

      <button className="reset-button" onClick={onResetFilters}>
        필터 초기화
      </button>
    </section>
  )
}
