import type { Product, ViewMode } from '../../_types/product'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  products: Product[]
  searchQuery: string
  viewMode: ViewMode
  wishlist: number[]
  onProductClick: (productId: number) => void
  onWishlistToggle: (productId: number) => void
}

export const ProductGrid = ({
  products,
  searchQuery,
  viewMode,
  wishlist,
  onProductClick,
  onWishlistToggle,
}: ProductGridProps) => {
  return (
    <section
      className="product-grid"
      style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : undefined}
    >
      {products.length === 0 ? (
        <div className="empty">조건에 맞는 상품이 없습니다.</div>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            searchQuery={searchQuery}
            isWished={wishlist.includes(product.id)}
            onProductClick={onProductClick}
            onWishlistToggle={onWishlistToggle}
          />
        ))
      )}
    </section>
  )
}
