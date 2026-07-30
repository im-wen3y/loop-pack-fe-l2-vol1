import { Suspense } from 'react'
import { ProductListContent } from '@/_pages/product-list/ui/ProductListContent'
import { Header } from '@/widgets/header'
import { PageContainer } from '@/shared/ui/PageContainer/PageContainer'
import { ProductGridSkeleton } from '@/widgets/product-card'
import '../../../examples/week-05-layout/week-05-layout.css'

const ProductListFallback = () => (
  <>
    <section className="week05-section">
      <h1>상품 목록</h1>
    </section>
    <section className="week05-section" aria-label="상품 검색 결과">
      <ProductGridSkeleton />
    </section>
  </>
)

export const ProductListPage = () => (
  <PageContainer>
    <Header />
    <Suspense fallback={<ProductListFallback />}>
      <ProductListContent />
    </Suspense>
  </PageContainer>
)
