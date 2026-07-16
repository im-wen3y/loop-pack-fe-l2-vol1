import type { Category } from '@/types/commerce'
import styles from './ProductFilters.module.css'

type ProductFiltersProps = {
  categories: readonly Category[]
}

export const ProductFilters = ({ categories }: ProductFiltersProps) => {
  return (
    <form className={styles.filters}>
      <label>
        검색
        <input name="q" placeholder="상품명 또는 브랜드" />
      </label>
      <label>
        카테고리
        <select name="category" defaultValue="all">
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
        <select name="sort" defaultValue="latest">
          <option value="latest">최신순</option>
        </select>
      </label>
    </form>
  )
}
