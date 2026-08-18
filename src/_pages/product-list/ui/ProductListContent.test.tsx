import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, HttpResponse, http } from 'msw'
import type { UrlUpdateEvent } from 'nuqs/adapters/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getProductListFixtureResponse,
  productListSuccessHandler,
} from '@/_pages/product-list/testing/product-list-handlers'
import { ProductListContent } from '@/_pages/product-list/ui/ProductListContent'
import { renderWithProviders } from '@/shared/test/render-with-providers'
import { server } from '@/shared/test/msw-server'

describe('ProductListContent', () => {
  beforeEach(() => {
    server.use(productListSuccessHandler)
  })

  it('상품 목록 응답을 받으면 상품을 표시한다', async () => {
    const { queryClient } = renderWithProviders(<ProductListContent />)

    expect(
      await screen.findByRole('heading', { level: 2, name: '캐주얼 신상품' }),
    ).toBeInTheDocument()
    queryClient.clear()
  })

  it('지연된 응답 전에는 상품이 없고 응답 후에는 상품을 표시한다', async () => {
    server.use(
      http.get('/api/products', async ({ request }) => {
        await delay(50)
        return HttpResponse.json(getProductListFixtureResponse(request))
      }),
    )

    const { queryClient } = renderWithProviders(<ProductListContent />)

    expect(
      screen.queryByRole('heading', { level: 2, name: '캐주얼 신상품' }),
    ).not.toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { level: 2, name: '캐주얼 신상품' }),
    ).toBeInTheDocument()
    queryClient.clear()
  })

  it('전체 결과가 0건이면 빈 결과를 표시하고 페이지 이동을 숨긴다', async () => {
    server.use(
      http.get('/api/products', () =>
        HttpResponse.json({ products: [], categories: [], totalCount: 0, page: 1, pageSize: 12 }),
      ),
    )

    const { queryClient } = renderWithProviders(<ProductListContent />)

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '페이지 이동' })).not.toBeInTheDocument()
    queryClient.clear()
  })

  it('전체 결과는 있지만 현재 페이지가 비었으면 이전 페이지로 돌아갈 수 있다', async () => {
    server.use(
      http.get('/api/products', () =>
        HttpResponse.json({ products: [], categories: [], totalCount: 14, page: 99, pageSize: 12 }),
      ),
    )

    const { queryClient } = renderWithProviders(<ProductListContent />, {
      searchParams: '?page=99',
    })

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '이전' })).toBeEnabled()
    expect(screen.getByText('99 / 2')).toBeInTheDocument()
    queryClient.clear()
  })

  it('500 응답이면 오류 안내와 재시도 동작을 표시한다', async () => {
    server.use(http.get('/api/products', () => new HttpResponse(null, { status: 500 })))

    const { queryClient } = renderWithProviders(<ProductListContent />)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByText('상품 목록을 불러오지 못했어요.')).toBeInTheDocument()
    expect(within(alert).getByRole('button', { name: '다시 시도' })).toBeEnabled()
    queryClient.clear()
  })

  it('재시도도 실패하면 오류를 유지하고 다음 재시도가 성공하면 상품을 표시한다', async () => {
    const user = userEvent.setup()
    let requestCount = 0
    server.use(
      http.get('/api/products', ({ request }) => {
        requestCount += 1

        return requestCount <= 2
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(getProductListFixtureResponse(request))
      }),
    )

    const { queryClient } = renderWithProviders(<ProductListContent />)
    const retryButton = await screen.findByRole('button', { name: '다시 시도' })

    await user.click(retryButton)

    await waitFor(() => expect(requestCount).toBe(2))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(retryButton)

    expect(
      await screen.findByRole('heading', { level: 2, name: '캐주얼 신상품' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    queryClient.clear()
  })

  it('3페이지에서 카테고리를 바꾸면 1페이지의 해당 상품을 요청한다', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()

    const { queryClient } = renderWithProviders(<ProductListContent />, {
      searchParams: '?page=3',
      onUrlUpdate,
    })
    await screen.findByText('검색 결과가 없습니다.')

    await user.selectOptions(screen.getByRole('combobox', { name: '카테고리' }), 'digital')

    expect(
      await screen.findByRole('heading', { level: 2, name: '디지털 실속상품' }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    const lastUpdate = onUrlUpdate.mock.lastCall?.[0]
    expect(lastUpdate?.searchParams.get('category')).toBe('digital')
    expect(lastUpdate?.searchParams.get('page')).toBeNull()
    queryClient.clear()
  })

  it('정렬을 바꾸면 새 순서의 상품 목록을 표시한다', async () => {
    const user = userEvent.setup()

    const { queryClient } = renderWithProviders(<ProductListContent />, {
      searchParams: '?page=2',
    })
    await screen.findByText('2 / 2')

    await user.selectOptions(screen.getByRole('combobox', { name: '정렬' }), 'price-asc')

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('디지털 실속상품')
    })
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    queryClient.clear()
  })

  it('페이지를 이동해도 선택한 카테고리를 유지한다', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()

    const { queryClient } = renderWithProviders(<ProductListContent />, {
      searchParams: '?category=casual&sort=price-asc',
      onUrlUpdate,
    })
    await screen.findByRole('heading', { level: 2, name: '캐주얼 신상품' })

    fireEvent.click(screen.getByRole('button', { name: '다음' }))

    expect(
      await screen.findByRole('heading', { level: 2, name: '캐주얼 기본상품 11' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: '카테고리' })).toHaveValue('casual')
    expect(screen.getByRole('combobox', { name: '정렬' })).toHaveValue('price-asc')
    const lastUpdate = onUrlUpdate.mock.lastCall?.[0]
    expect(lastUpdate?.searchParams.get('category')).toBe('casual')
    expect(lastUpdate?.searchParams.get('sort')).toBe('price-asc')
    expect(lastUpdate?.searchParams.get('page')).toBe('2')
    queryClient.clear()
  })
})
