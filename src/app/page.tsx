import { categories } from '@/app/api/_data/commerce'
import { HeroBanner } from '@/components/ui/banner/HeroBanner'
import { CategorySection } from '@/components/ui/categorySection/CategorySection'
import { Header } from '@/components/ui/header/Header'
import { PageContainer } from '@/components/ui/pageContainer/PageContainer'
import { ProductGrid } from '@/components/ui/productGrid/ProductGrid'
import type { ProductCardItem } from '@/components/ui/productCard/ProductCard'
import '../examples/week-05-layout/week-05-layout.css'

const HOME_PRODUCT_SECTIONS: Array<{
  title: string
  products: ProductCardItem[]
}> = [
  {
    title: '인기 상품',
    products: Array.from({ length: 4 }, (_, index) => ({
      id: `popular-${index + 1}`,
      image: '/images/products/p1.jpg',
      name: '[11월 20일 예약배송] Winter Rocky Pants 2color 윈터 로키팬츠 OG',
      brand: '브랜드',
      price: 0,
    })),
  },
  {
    title: '신상품',
    products: Array.from({ length: 4 }, (_, index) => ({
      id: `new-${index + 1}`,
      image: '/images/products/p6.jpg',
      name: 'WOMAN GNRL 케이블 풀오버 [IVORY] / WBC3L05502',
      brand: '브랜드',
      price: 0,
    })),
  },
]

export default function Home() {
  return (
    <PageContainer>
      <Header />
      <HeroBanner />
      <CategorySection categories={categories} />
      {HOME_PRODUCT_SECTIONS.map(({ title, products }) => (
        <section className="week05-section" key={title}>
          <h2>{title}</h2>
          <ProductGrid products={products} titleLevel={3} />
        </section>
      ))}
    </PageContainer>
  )
}
