// 현재 페이지 기준 앞뒤 2개씩(최대 5개)의 페이지 번호 윈도우를 만든다.
export const getPageNumbers = (page: number, totalPages: number): number[] => {
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  const pages: number[] = []
  for (let p = startPage; p <= endPage; p++) pages.push(p)
  return pages
}
