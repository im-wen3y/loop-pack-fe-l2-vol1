import { useLocalStorageState } from '../useLocalStorageState'

const STORAGE_KEY = 'recentlyViewed'
const MAX_ITEMS = 10

// 최근 본 상품 id를 localStorage에 유지한다. 가장 최근 항목을 맨 앞에 두고,
// 중복은 제거하며, 최대 MAX_ITEMS개까지만 보관한다.
export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState<number[]>(STORAGE_KEY, [])

  const addRecentlyViewed = (productId: number) => {
    setRecentlyViewed((prev) => {
      const withoutCurrent = prev.filter((id) => id !== productId)
      return [productId, ...withoutCurrent].slice(0, MAX_ITEMS)
    })
  }

  return { recentlyViewed, addRecentlyViewed }
}
