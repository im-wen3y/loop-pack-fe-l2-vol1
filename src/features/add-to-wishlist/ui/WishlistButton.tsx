'use client'

import { selectIsWishlisted, useWishlistStore } from '@/entities/wishlist'
import styles from './WishlistButton.module.css'

type WishlistButtonProps = {
  productId: string
  productName: string
}

// 찜은 켜고 끄는 동작이라 toggle을 그대로 쓴다. 장바구니만 add/remove로 갈라졌다.
export const WishlistButton = ({ productId, productName }: WishlistButtonProps) => {
  const isWishlisted = useWishlistStore(selectIsWishlisted(productId))
  const toggleWishlist = useWishlistStore((state) => state.toggle)

  return (
    <button
      className={styles.button}
      type="button"
      aria-label={`${productName} 위시리스트`}
      aria-pressed={isWishlisted}
      onClick={() => toggleWishlist(productId)}
    >
      찜
    </button>
  )
}
