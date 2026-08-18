import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCartStore } from '@/entities/cart'
import { AddCartButton } from '@/features/add-to-cart'
import { Header } from '@/widgets/header/Header'
import { renderWithProviders } from '@/shared/test/render-with-providers'

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
}))

const resetCart = () => {
  for (const id of useCartStore.getState().ids) {
    useCartStore.getState().toggle(id)
  }
}

describe('Header와 AddCartButton', () => {
  beforeEach(resetCart)

  it('상품을 담고 다시 빼면 버튼 상태와 헤더 개수가 함께 바뀐다', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Header />
        <AddCartButton productId="product-1" productName="테스트 상품" />
      </>,
    )
    const cartButton = screen.getByRole('button', { name: '테스트 상품 장바구니' })

    expect(cartButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('장바구니 0')).toBeInTheDocument()

    await user.click(cartButton)

    expect(cartButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('장바구니 1')).toBeInTheDocument()

    await user.click(cartButton)

    expect(cartButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('장바구니 0')).toBeInTheDocument()
  })
})
