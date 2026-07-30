'use client'

import { useProductCardActions } from '@/features/product-card/model/useProductCardActions'
import styles from './ProductCard.module.css'

type ProductCardActionsProps = {
  productId: string
  productName: string
}

// 찜/담기 버튼만 담은 Client 리프. 카드 전체를 Client로 만들지 않도록 경계를 여기까지 내렸다.
// store 구독과 토글은 useProductCardActions가 맡고, 여기는 표시와 이벤트 연결만 한다.
export const ProductCardActions = ({ productId, productName }: ProductCardActionsProps) => {
  const { isWishlisted, isInCart, toggleWishlist, toggleCart } = useProductCardActions(productId)

  return (
    <div className={styles.actions}>
      <button
        type="button"
        aria-label={`${productName} 위시리스트`}
        aria-pressed={isWishlisted}
        onClick={toggleWishlist}
      >
        찜
      </button>
      <button
        type="button"
        aria-label={`${productName} 장바구니`}
        aria-pressed={isInCart}
        onClick={toggleCart}
      >
        담기
      </button>
    </div>
  )
}
