import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/entities/cart/model/cart'
import { isRecord } from '@/shared/lib/is-record'

// 수량이 생기면서 위시리스트와 로직이 갈라져, 공용 팩토리에서 떼어낸 독립 구현이다.
// 담기/빼기가 한 버튼이던 toggle은 add/remove로 나눴다. 수량 3에서 다시 누르면
// 무엇이 되어야 하는지가 정해지지 않아, 제거는 장바구니 화면의 명시적 동작으로 옮겼다.
//
// 목록은 소유자별로 나눠 들고, 현재 소유자의 것만 파생해서 읽는다(selectCartItems).
// items를 따로 들지 않는 이유는 byOwner와 두 벌이 되면 저장 시점에 어느 쪽이 진실인지
// 갈리기 때문이다. 진실은 byOwner 하나이고, 소유자 전환은 ownerId만 바꾸면 끝난다.
export type CartStore = {
  ownerId: string | null
  byOwner: Record<string, CartItem[]>
  setOwner: (ownerId: string | null) => void
  add: (productId: string) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearAll: () => void
}

// 소유자가 없거나 담은 것이 없을 때 항상 같은 참조를 돌려준다.
// 매번 새 배열을 만들면 selector 결과가 늘 달라 보여 리렌더가 멈추지 않는다.
const EMPTY_ITEMS: CartItem[] = []

export const selectCartItems = (state: CartStore): CartItem[] =>
  state.ownerId === null ? EMPTY_ITEMS : (state.byOwner[state.ownerId] ?? EMPTY_ITEMS)

// 헤더 배지가 쓰는 값. 담긴 상품의 종류 수이고 수량 합이 아니다.
// 같은 상품을 셋 담아도 1이며, 수량은 장바구니 화면에서 본다.
export const selectCartCount = (state: CartStore): number => selectCartItems(state).length

export const selectIsInCart =
  (productId: string) =>
  (state: CartStore): boolean =>
    selectCartItems(state).some((item) => item.productId === productId)

// 현재 소유자의 목록만 바꾼다. 미로그인 상태에서는 담을 수 없다 —
// 담기 버튼이 로그인으로 보내지만, store가 스스로 막아야 주인 없는 목록이 생기지 않는다.
const updateItems = (
  state: CartStore,
  update: (items: CartItem[]) => CartItem[],
): Partial<CartStore> => {
  const { ownerId } = state
  if (ownerId === null) {
    return {}
  }

  return {
    byOwner: { ...state.byOwner, [ownerId]: update(state.byOwner[ownerId] ?? EMPTY_ITEMS) },
  }
}

const isCartItem = (value: unknown): value is CartItem =>
  isRecord(value) &&
  typeof value.productId === 'string' &&
  typeof value.quantity === 'number' &&
  Number.isSafeInteger(value.quantity) &&
  value.quantity >= 1

// 저장값이 손상·조작됐을 때 읽을 수 있는 항목만 남긴다.
const toValidByOwner = (persisted: unknown): Record<string, CartItem[]> => {
  if (!isRecord(persisted) || !isRecord(persisted.byOwner)) {
    return {}
  }

  const byOwner: Record<string, CartItem[]> = {}
  for (const [ownerId, items] of Object.entries(persisted.byOwner)) {
    byOwner[ownerId] = Array.isArray(items) ? items.filter(isCartItem) : []
  }

  return byOwner
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      ownerId: null,
      byOwner: {},

      // 목록이 파생값이라 소유자 전환에 보관·복원 절차가 없다. 가리키는 곳만 바뀐다.
      setOwner: (ownerId) => set({ ownerId }),

      // 이미 담긴 상품이면 수량을 하나 올린다. 다시 눌러도 빠지지 않는다.
      add: (productId) =>
        set((state) =>
          updateItems(state, (items) =>
            items.some((item) => item.productId === productId)
              ? items.map((item) =>
                  item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
                )
              : [...items, { productId, quantity: 1 }],
          ),
        ),

      remove: (productId) =>
        set((state) =>
          updateItems(state, (items) => items.filter((item) => item.productId !== productId)),
        ),

      // 주문 API가 1 이상의 정수만 받는다. 그 밖의 값은 무시하고, 0으로 내리는 것은 remove의 일이다.
      setQuantity: (productId, quantity) =>
        set((state) =>
          Number.isSafeInteger(quantity) && quantity >= 1
            ? updateItems(state, (items) =>
                items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
              )
            : {},
        ),

      clearAll: () => set((state) => updateItems(state, () => EMPTY_ITEMS)),
    }),
    {
      name: 'cart',
      version: 2,
      // byOwner만 저장한다. ownerId까지 저장하면 로그아웃한 브라우저가 마지막 소유자의
      // 목록을 계속 보여준다. 저장된 것은 데이터이고, 지금 누구인지는 매 로드마다 세션이 정한다.
      partialize: (state) => ({ byOwner: state.byOwner }),
      // v1은 로그인 없이 담긴 `{ ids: string[] }`라 주인을 알 수 없다. 처음 로그인한
      // 사람에게 넘기면 공용 브라우저에서 남의 장바구니를 주는 셈이라 옮기지 않고 버린다.
      migrate: () => ({ byOwner: {} }),
      // 매 복원 시 저장값을 검증한다.
      merge: (persisted, current) => ({ ...current, byOwner: toValidByOwner(persisted) }),
    },
  ),
)
