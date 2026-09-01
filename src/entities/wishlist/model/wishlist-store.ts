import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isRecord } from '@/shared/lib/is-record'

// 장바구니가 수량 때문에 갈라지면서 공용 팩토리를 버렸고, 위시리스트도 독립 구현이 됐다.
// 다만 찜은 켜고 끄는 동작이라 toggle을 그대로 둔다. 갈라진 것은 아이템 쪽뿐이고,
// 소유자별로 목록을 나눠 드는 구조는 장바구니와 같다.
export type WishlistStore = {
  ownerId: string | null
  byOwner: Record<string, string[]>
  setOwner: (ownerId: string | null) => void
  toggle: (productId: string) => void
}

// 소유자가 없거나 찜한 것이 없을 때 항상 같은 참조를 돌려준다.
const EMPTY_IDS: string[] = []

export const selectWishlistIds = (state: WishlistStore): string[] =>
  state.ownerId === null ? EMPTY_IDS : (state.byOwner[state.ownerId] ?? EMPTY_IDS)

export const selectWishlistCount = (state: WishlistStore): number => selectWishlistIds(state).length

export const selectIsWishlisted =
  (productId: string) =>
  (state: WishlistStore): boolean =>
    selectWishlistIds(state).includes(productId)

// 미로그인 상태에서는 찜할 수 없다. 찜 버튼이 로그인으로 보내지만,
// store가 스스로 막아야 주인 없는 목록이 생기지 않는다.
const updateIds = (
  state: WishlistStore,
  update: (ids: string[]) => string[],
): Partial<WishlistStore> => {
  const { ownerId } = state
  if (ownerId === null) {
    return {}
  }

  return { byOwner: { ...state.byOwner, [ownerId]: update(state.byOwner[ownerId] ?? EMPTY_IDS) } }
}

// 저장값이 손상·조작됐을 때 읽을 수 있는 id만 남긴다.
const toValidByOwner = (persisted: unknown): Record<string, string[]> => {
  if (!isRecord(persisted) || !isRecord(persisted.byOwner)) {
    return {}
  }

  const byOwner: Record<string, string[]> = {}
  for (const [ownerId, ids] of Object.entries(persisted.byOwner)) {
    byOwner[ownerId] = Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : []
  }

  return byOwner
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      ownerId: null,
      byOwner: {},

      setOwner: (ownerId) => set({ ownerId }),

      toggle: (productId) =>
        set((state) =>
          updateIds(state, (ids) =>
            ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
          ),
        ),
    }),
    {
      name: 'wishlist',
      version: 2,
      // ownerId는 저장하지 않는다. 이유는 cart-store와 같다.
      partialize: (state) => ({ byOwner: state.byOwner }),
      // v1의 `{ ids: string[] }`는 주인을 알 수 없어 버린다.
      migrate: () => ({ byOwner: {} }),
      merge: (persisted, current) => ({ ...current, byOwner: toValidByOwner(persisted) }),
    },
  ),
)
