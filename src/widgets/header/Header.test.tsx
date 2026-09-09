import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCartStore } from '@/entities/cart'
import { selectWishlistItems, useWishlistStore } from '@/entities/wishlist'
import { AddCartButton } from '@/features/add-to-cart'
import { WishlistButton } from '@/features/add-to-wishlist'
import { HeaderNav } from '@/widgets/header/HeaderNav'
import { renderWithProviders } from '@/shared/test/render-with-providers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
  useRouter: () => ({ push: () => {} }),
}))

const TEST_OWNER = 'test-user'

const TEST_USER = { id: TEST_OWNER, name: '테스트 사용자', email: 'test@example.com' }

const testProduct = (id: string, name: string) => ({
  id,
  name,
  brand: '테스트 브랜드',
  image: '/test.png',
  price: 1_000,
})

const resetCollections = () => {
  useCartStore.getState().setOwner(TEST_OWNER)
  useWishlistStore.getState().setOwner(TEST_OWNER)

  useCartStore.getState().clearAll()

  for (const item of selectWishlistItems(useWishlistStore.getState())) {
    useWishlistStore.getState().toggle(item)
  }
}

describe('Header와 담기·찜 버튼', () => {
  beforeEach(resetCollections)

  it('찜을 눌러도 장바구니 개수는 그대로다', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <HeaderNav user={TEST_USER} />
        <WishlistButton product={testProduct('product-1', '테스트 상품')} />
        <AddCartButton product={testProduct('product-1', '테스트 상품')} />
      </>,
    )
    const wishlistButton = screen.getByRole('button', { name: '테스트 상품 위시리스트' })

    await user.click(wishlistButton)

    expect(wishlistButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('위시리스트 1')).toBeInTheDocument()
    expect(screen.getByText('장바구니 0')).toBeInTheDocument()
  })

  it('서로 다른 상품을 담으면 헤더 개수가 담은 상품 수만큼 늘어난다', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <HeaderNav user={TEST_USER} />
        <AddCartButton product={testProduct('product-1', '첫 번째 상품')} />
        <AddCartButton product={testProduct('product-2', '두 번째 상품')} />
      </>,
    )

    await user.click(screen.getByRole('button', { name: '첫 번째 상품 장바구니' }))
    await user.click(screen.getByRole('button', { name: '두 번째 상품 장바구니' }))

    expect(screen.getByText('장바구니 2')).toBeInTheDocument()
  })
})
