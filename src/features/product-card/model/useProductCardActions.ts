import { useCartStore } from '@/entities/cart'
import { useWishlistStore } from '@/entities/wishlist'

// 카드에서 할 수 있는 찜·담기 행위를 한곳에서 모은다. 두 entity의 store를 여기서만 구독하고,
// UI는 상태와 토글 함수만 받는다.
// persist store를 훅으로 읽으면 zustand의 getServerSnapshot(초기값) 덕분에 hydration 렌더가
// 서버와 일치한다 → 별도 hydration 가드 없이 그대로 구독한다.
// 각 값은 자기 상품의 담김 여부만 selector로 좁혀 구독한다.
export const useProductCardActions = (productId: string) => {
  const isWishlisted = useWishlistStore((state) => state.ids.includes(productId))
  const isInCart = useCartStore((state) => state.ids.includes(productId))
  const toggleWishlistId = useWishlistStore((state) => state.toggle)
  const toggleCartId = useCartStore((state) => state.toggle)

  return {
    isWishlisted,
    isInCart,
    toggleWishlist: () => toggleWishlistId(productId),
    toggleCart: () => toggleCartId(productId),
  }
}
