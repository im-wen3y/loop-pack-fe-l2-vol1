/**
 * @vitest-environment jsdom
 *
 * getProductList가 `/api/products` 상대 경로로 요청한다. MSW 인터셉터는
 * location.href를 기준으로 Request를 만들므로 이 파일에만 jsdom 환경을 사용한다.
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { getProductList } from './api'
import { server } from '@/shared/test/msw-server'

describe('getProductList', () => {
  it('고정 pageSize를 포함해 상품 목록을 요청한다', async () => {
    const response = {
      products: [],
      categories: [],
      totalCount: 0,
      page: 1,
      pageSize: 12,
    }
    server.use(
      http.get('/api/products', ({ request }) => {
        const url = new URL(request.url)

        expect(url.searchParams.get('page')).toBe('1')
        expect(url.searchParams.get('pageSize')).toBe('12')

        return HttpResponse.json(response)
      }),
    )

    await expect(getProductList({ page: 1 })).resolves.toEqual(response)
  })

  it('HTTP 오류의 status를 보존한다', async () => {
    server.use(http.get('/api/products', () => new HttpResponse(null, { status: 500 })))

    await expect(getProductList({ page: 1 })).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'http',
      status: 500,
    })
  })

  it('fetch 실패를 네트워크 오류로 변환한다', async () => {
    server.use(http.get('/api/products', () => HttpResponse.error()))

    await expect(getProductList({ page: 1 })).rejects.toMatchObject({
      name: 'ApiError',
      kind: 'network',
    })
  })
})
