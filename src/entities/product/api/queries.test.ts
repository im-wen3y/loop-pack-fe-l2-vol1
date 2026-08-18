import { describe, expect, it } from 'vitest'
import { productQueryKeys, shouldThrowProductListError } from './queries'
import { ApiError } from '@/shared/api/api-error'

describe('shouldThrowProductListError', () => {
  it('HTTP 오류는 목록 내부에서 처리한다', () => {
    const error = new ApiError('서버 오류', { kind: 'http', status: 500 })

    expect(shouldThrowProductListError(error)).toBe(false)
  })

  it('네트워크 오류는 목록 내부에서 처리한다', () => {
    const error = new ApiError('네트워크 오류', { kind: 'network' })

    expect(shouldThrowProductListError(error)).toBe(false)
  })

  it('API 계약 밖의 오류는 Error Boundary로 보낸다', () => {
    expect(shouldThrowProductListError(new SyntaxError('잘못된 JSON'))).toBe(true)
  })
})

describe('productQueryKeys.list', () => {
  it('값이 같은 URL 조건은 같은 query key로 조립한다', () => {
    const firstParams = { q: '셔츠', category: 'fashion', sort: 'popular', page: 2 } as const
    const secondParams = { q: '셔츠', category: 'fashion', sort: 'popular', page: 2 } as const

    expect(productQueryKeys.list(firstParams)).toEqual(productQueryKeys.list(secondParams))
  })

  it('페이지가 다르면 다른 query key로 조립한다', () => {
    const firstPage = { category: 'all', sort: 'latest', page: 1 } as const
    const secondPage = { category: 'all', sort: 'latest', page: 2 } as const

    expect(productQueryKeys.list(firstPage)).not.toEqual(productQueryKeys.list(secondPage))
  })
})
