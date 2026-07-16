import { categories } from '@/app/api/_data/commerce'
import { Header } from '@/components/ui/header/Header'
import { PageContainer } from '@/components/ui/pageContainer/PageContainer'
import { Pagination } from '@/components/ui/pagination/Pagination'
import { ProductFilters } from '@/components/ui/productFilters/ProductFilters'
import { ProductGrid } from '@/components/ui/productGrid/ProductGrid'
import type { ProductCardItem } from '@/components/ui/productCard/ProductCard'
import '../../examples/week-05-layout/week-05-layout.css'

const PRODUCT_LIST: ProductCardItem[] = Array.from({ length: 8 }, (_, index) => {
  const isLipMask = index % 2 === 0

  return {
    id: `product-list-${index + 1}`,
    image: isLipMask ? '/images/products/p11.jpg' : '/images/products/p16.jpg',
    name: isLipMask
      ? '하이드레이팅 나이트 립 마스크 25g + 소프트 글로우 결 토너 210ml'
      : '스탠리 클래식 런치박스',
    brand: '브랜드',
    price: 0,
  }
})

export default function ProductList() {
  return (
    <PageContainer>
      <Header />
      <section className="week05-section">
        <h1>상품 목록</h1>
        <ProductFilters categories={categories} />
      </section>
      <section className="week05-section" aria-label="상품 검색 결과">
        <p>총 0개</p>
        <ProductGrid products={PRODUCT_LIST} titleLevel={2} />
        <Pagination currentPage={1} totalPages={1} />
      </section>
    </PageContainer>
  )
}
