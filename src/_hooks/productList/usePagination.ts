import { useEffect, useState } from 'react'

// 현재 페이지 번호와 이동 동작만 책임진다. 전체 페이지 수(totalPages)는
// 서버 데이터(totalCount)에 의존하므로 이 훅이 알지 않고, 목록 쿼리 쪽에서 계산한다.
// page가 바뀌면 화면을 맨 위로 스크롤한다.
export const usePagination = () => {
  const [page, setPage] = useState(1)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const goToPage = (next: number) => setPage(next)

  const resetPage = () => setPage(1)

  return { page, goToPage, resetPage }
}
