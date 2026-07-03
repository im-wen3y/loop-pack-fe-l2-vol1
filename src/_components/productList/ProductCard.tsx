import type { Product } from '../../_types/product'
import { formatPrice } from '../../_utils/format'
import { getHighlightSegments } from '../../_utils/string'
import {
  getDiscountRate,
  hasFreeShipping,
  isAlmostSoldOut,
  isBestProduct,
  isHotDeal,
  isNewProduct,
  isSoldOut,
} from '../../_utils/productList/productBadge'

type ProductCardProps = {
  product: Product
  searchQuery: string
  isWished: boolean
  onProductClick: (productId: number) => void
  onWishlistToggle: (productId: number) => void
}

export const ProductCard = ({
  product,
  searchQuery,
  isWished,
  onProductClick,
  onWishlistToggle,
}: ProductCardProps) => {
  const discountRate = getDiscountRate(product.price, product.originalPrice)
  const nameSegments = getHighlightSegments(product.name, searchQuery)
  const soldOut = isSoldOut(product.stock)

  return (
    <article className="product-card" onClick={() => onProductClick(product.id)}>
      <div className="image-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {discountRate > 0 && <span className="badge badge-discount">{discountRate}% 할인</span>}
        {isNewProduct(product.createdAt) && <span className="badge badge-new">NEW</span>}
        {isHotDeal(discountRate) && <span className="badge badge-hot">특가</span>}
        {isBestProduct(product.rating, product.reviewCount) && (
          <span className="badge badge-best">BEST</span>
        )}
        {soldOut && <span className="badge badge-soldout">품절</span>}
        {!soldOut && isAlmostSoldOut(product.stock) && (
          <span className="badge badge-warning">품절 임박</span>
        )}
      </div>

      <div className="card-body">
        <h3 className="product-name">
          {nameSegments.map((segment, i) =>
            segment.isMatch ? (
              <mark key={i} style={{ background: '#fff176', padding: 0 }}>
                {segment.text}
              </mark>
            ) : (
              segment.text
            ),
          )}
        </h3>
        <div className="price-area">
          {product.originalPrice && (
            <span className="original-price">{formatPrice(product.originalPrice)}</span>
          )}
          <span className="price">{formatPrice(product.price)}</span>
          {hasFreeShipping(product.price) && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                color: '#2e7d32',
                fontWeight: 600,
              }}
            >
              무료배송
            </span>
          )}
        </div>
        <div className="rating-area">
          <span className="rating">★ {product.rating.toFixed(1)}</span>
          <span className="review-count">({product.reviewCount.toLocaleString()})</span>
          <button
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
            }}
            onClick={(e) => {
              e.stopPropagation()
              onWishlistToggle(product.id)
            }}
            aria-label="위시리스트 토글"
          >
            {isWished ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </article>
  )
}
