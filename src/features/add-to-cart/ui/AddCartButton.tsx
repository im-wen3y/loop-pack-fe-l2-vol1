'use client'

import { useCartStore } from '@/entities/cart'
import type { ProductSummary } from '@/entities/product'
import styles from './AddCartButton.module.css'

type AddCartButtonProps = {
  product: ProductSummary
}

// 담기만 한다. 제거는 장바구니 화면이 맡는다.
//
// aria-pressed를 뗐다. 수량이 생기면서 "다시 누르면 빠진다"가 성립하지 않게 됐고
// (수량 3에서 다시 누르면?), 눌린 상태를 표시할 대상이 사라졌다. 이제 누를 때마다 수량이 하나 오른다.
//
// id만이 아니라 상품 전체를 받는 것은 store가 담은 시점의 표시 정보를 함께 들기 때문이다.
// 장바구니·주문서가 상품을 그려야 하는데 상품을 id로 조회하는 API가 없다.
//
// TODO(다음 단계): 담은 뒤 장바구니로 갈지 묻는 확인 창을 붙인다. 지금은 눌러도 화면 반응이 없다.
export const AddCartButton = ({ product }: AddCartButtonProps) => {
  const addToCart = useCartStore((state) => state.add)

  return (
    <button
      className={styles.button}
      type="button"
      aria-label={`${product.name} 장바구니`}
      onClick={() => addToCart(product)}
    >
      담기
    </button>
  )
}
