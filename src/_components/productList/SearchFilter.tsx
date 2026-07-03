import type { ChangeEvent } from 'react'
import type { CategoryFilter } from '../../_types/product'

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'electronics', label: '전자제품' },
  { value: 'fashion', label: '패션' },
  { value: 'home', label: '홈' },
  { value: 'beauty', label: '뷰티' },
]

type SearchFilterProps = {
  category: CategoryFilter
  minPrice: number | ''
  maxPrice: number | ''
  inStockOnly: boolean
  onCategoryChange: (category: CategoryFilter) => void
  onMinPriceChange: (value: number | '') => void
  onMaxPriceChange: (value: number | '') => void
  onInStockOnlyChange: (isInStockOnly: boolean) => void
  onResetFilters: () => void
}

const parsePrice = (value: string): number | '' => (value === '' ? '' : Number(value))

export const SearchFilter = ({
  category,
  minPrice,
  maxPrice,
  inStockOnly,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockOnlyChange,
  onResetFilters,
}: SearchFilterProps) => {
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
