'use client'

import { useEffect, useRef } from 'react'
import { useProductFilters } from '@/app/products/_components/useProductFilters'
import type { Category, ProductSort } from '@/types/commerce'
import styles from './ProductFilters.module.css'

type ProductFiltersProps = {
  categories: readonly Category[]
}

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
] as const satisfies readonly { value: ProductSort; label: string }[]

export const ProductFilters = ({ categories }: ProductFiltersProps) => {
  const { q, category, sort, setQuery, setCategory, setSort } = useProductFilters()
  const queryInputRef = useRef<HTMLInputElement>(null)

  // input은 타이핑 중인 값을 자체 보유하고, URL이 뒤로·앞으로 바뀔 때만 복원한다.
  useEffect(() => {
    if (queryInputRef.current && queryInputRef.current.value !== q) {
      queryInputRef.current.value = q
    }
  }, [q])

  // select가 주는 event.target.value는 string이라, 유효한 리터럴 값으로 좁힌 뒤 세터에 넘긴다.
  const handleCategoryChange = (value: string) => {
    const nextCategory = value === 'all' ? 'all' : categories.find(({ id }) => id === value)?.id
    if (!nextCategory) return
    setCategory(nextCategory)
  }

  const handleSortChange = (value: string) => {
    const nextSort = SORT_OPTIONS.find((option) => option.value === value)?.value
    if (!nextSort) return
    setSort(nextSort)
  }

  return (
    <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
      <label>
        검색
        <input
          ref={queryInputRef}
          name="q"
          placeholder="상품명 또는 브랜드"
          defaultValue={q}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <label>
        카테고리
        <select
          name="category"
          value={category}
          onChange={(event) => handleCategoryChange(event.target.value)}
        >
          <option value="all">전체</option>
          {categories.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        정렬
        <select name="sort" value={sort} onChange={(event) => handleSortChange(event.target.value)}>
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </form>
  )
}
