'use client'

import type { ProductSummary } from '@/entities/product'
import { selectIsWishlisted, useWishlistStore } from '@/entities/wishlist'
import styles from './WishlistButton.module.css'

type WishlistButtonProps = {
  product: ProductSummary
}

// 찜은 켜고 끄는 동작이라 toggle을 그대로 쓴다. 장바구니만 add/remove로 갈라졌다.
//
// id만이 아니라 상품 전체를 받는 것은 store가 표시 정보를 함께 들기 때문이다.
// 위시리스트 화면이 카드를 그리려면 이름·이미지·가격이 필요한데 상품을 id로 조회하는 API가 없다.
export const WishlistButton = ({ product }: WishlistButtonProps) => {
  const isWishlisted = useWishlistStore(selectIsWishlisted(product.id))
  const toggleWishlist = useWishlistStore((state) => state.toggle)

  return (
    <button
      className={styles.button}
      type="button"
      aria-label={`${product.name} 위시리스트`}
      aria-pressed={isWishlisted}
      onClick={() => toggleWishlist(product)}
    >
      찜
    </button>
  )
}
