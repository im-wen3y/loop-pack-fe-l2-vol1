'use client'

import { useQueryStates } from 'nuqs'
import { productListParsers } from '@/service/products/searchParams'
import { useProductListQuery } from '@/service/products/service'
import { ProductFilters } from '@/app/products/_components/ProductFilters'
import { ProductListResults } from '@/app/products/_components/ProductListResults'

export const ProductListContent = () => {
  const [searchParams] = useQueryStates(productListParsers)
  // 상품 목록은 조건 전환 중 이전 데이터를 유지해야 하므로 useQuery를 사용한다.
  const query = useProductListQuery(searchParams)
  const categories = query.data?.categories ?? []

  return (
    <>
      <section className="week05-section">
        <h1>상품 목록</h1>
        {categories.length > 0 && <ProductFilters categories={categories} />}
      </section>
      <section className="week05-section" aria-label="상품 검색 결과">
        <ProductListResults query={query} />
      </section>
    </>
  )
}
