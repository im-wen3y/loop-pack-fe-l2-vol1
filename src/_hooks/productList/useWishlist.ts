import { useLocalStorageState } from '../useLocalStorageState'

const STORAGE_KEY = 'wishlist'

// 위시리스트에 담긴 상품 id 목록을 localStorage에 유지하고, 토글만 노출한다.
export const useWishlist = () => {
  const [wishlist, setWishlist] = useLocalStorageState<number[]>(STORAGE_KEY, [])

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  return { wishlist, toggleWishlist }
}
