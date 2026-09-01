import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCartStore } from '@/entities/cart'
import { selectWishlistItems, useWishlistStore } from '@/entities/wishlist'
import { AddCartButton } from '@/features/add-to-cart'
import { WishlistButton } from '@/features/add-to-wishlist'
import { Header } from '@/widgets/header/Header'
import { renderWithProviders } from '@/shared/test/render-with-providers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
}))

// 두 store가 소유자별로 목록을 나눠 들게 되면서, 소유자가 없으면 아무것도 담기지 않는다.
// 테스트용 소유자를 세우고 시작한다.
const TEST_OWNER = 'test-user'

// store가 담은 시점의 표시 정보를 함께 들게 되면서 버튼이 상품 전체를 받는다.
// 이 테스트가 보는 것은 헤더 숫자라, 표시 필드는 형태만 맞춘 값으로 채운다.
const testProduct = (id: string, name: string) => ({
  id,
  name,
  brand: '테스트 브랜드',
  image: '/test.png',
  price: 1_000,
})

// store가 모듈 전역이라 테스트 사이에 담긴 id가 남는다. 소비처에서 setState를 쓰지 않는
// 규칙을 지키기 위해 store가 공개한 action으로만 비운다.
const resetCollections = () => {
  useCartStore.getState().setOwner(TEST_OWNER)
  useWishlistStore.getState().setOwner(TEST_OWNER)

  useCartStore.getState().clearAll()

  for (const item of selectWishlistItems(useWishlistStore.getState())) {
    useWishlistStore.getState().toggle(item)
  }
}

// 계획서 12번 — docs/rfc/week08-test-plan.md
describe('Header와 담기·찜 버튼', () => {
  beforeEach(resetCollections)

  // 8주차에 있던 "담고 다시 빼면 버튼 상태와 헤더 개수가 함께 바뀐다"를 삭제했다.
  // 담기 버튼의 aria-pressed로 "담겼나 / 빠졌나"를 대신 보던 테스트인데, 장바구니에 수량이
  // 들어오면서 그 상태 자체가 없어졌다. 담기는 누를 때마다 수량을 하나 올리고 다시 눌러도
  // 빠지지 않으며(수량 3에서 다시 누르면 무엇이 되어야 하는지 정할 수 없다), 제거는
  // 장바구니 화면의 명시적 동작이 됐다.
  //
  // 담겼는지 빠졌는지는 장바구니 화면에 목록으로 그대로 보이므로, 그 화면이 생기면 거기서
  // 검증한다. 여기 남긴 두 테스트는 "버튼을 누르면 헤더 숫자가 따라 움직인다"는 연결만 본다.
  // (it.skip이나 주석 처리로 비활성화하지 않고 지웠다 — 검증할 동작이 사라진 것이라
  //  되살릴 대상이 없다.)

  it('찜을 눌러도 장바구니 개수는 그대로다', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Header />
        <WishlistButton product={testProduct('product-1', '테스트 상품')} />
        <AddCartButton product={testProduct('product-1', '테스트 상품')} />
      </>,
    )
    const wishlistButton = screen.getByRole('button', { name: '테스트 상품 위시리스트' })

    await user.click(wishlistButton)

    // 찜은 켜고 끄는 동작이라 aria-pressed가 그대로 남는다. 담기 버튼만 상태를 잃었다.
    expect(wishlistButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('위시리스트 1')).toBeInTheDocument()
    expect(screen.getByText('장바구니 0')).toBeInTheDocument()
  })

  it('서로 다른 상품을 담으면 헤더 개수가 담은 상품 수만큼 늘어난다', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Header />
        <AddCartButton product={testProduct('product-1', '첫 번째 상품')} />
        <AddCartButton product={testProduct('product-2', '두 번째 상품')} />
      </>,
    )

    await user.click(screen.getByRole('button', { name: '첫 번째 상품 장바구니' }))
    await user.click(screen.getByRole('button', { name: '두 번째 상품 장바구니' }))

    // 배지는 담긴 상품의 종류 수다. 수량 합이 아니라는 것은 store 쪽에서 본다.
    expect(screen.getByText('장바구니 2')).toBeInTheDocument()
  })
})
