import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useProductFilters } from './useProductFilters'

const nuqsMock = vi.hoisted(() => ({
  query: '',
  setParams: vi.fn(),
}))

vi.mock('nuqs', () => ({
  useQueryStates: () => [
    { q: nuqsMock.query, category: 'all', sort: 'latest' },
    nuqsMock.setParams,
  ],
}))

describe('useProductFilters 검색어 debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    nuqsMock.query = ''
    nuqsMock.setParams.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('입력 후 300ms가 지나면 검색어를 반영하고 첫 페이지로 이동한다', () => {
    const { result } = renderHook(() => useProductFilters())

    act(() => {
      result.current.setQuery('셔츠')
      vi.advanceTimersByTime(300)
    })

    expect(nuqsMock.setParams).toHaveBeenCalledWith({ q: '셔츠', page: 1 })
  })

  it('대기 중 URL 검색어가 바뀌면 이전 입력을 반영하지 않는다', () => {
    const { result, rerender } = renderHook(() => useProductFilters())

    act(() => {
      result.current.setQuery('이전 검색어')
    })
    nuqsMock.query = '복원된 검색어'
    rerender()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(nuqsMock.setParams).not.toHaveBeenCalled()
  })
})
