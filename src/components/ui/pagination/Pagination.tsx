import styles from './Pagination.module.css'

type PaginationProps = {
  currentPage: number
  totalPages: number
}

export const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  return (
    <nav className={styles.pagination} aria-label="페이지 이동">
      <button type="button">이전</button>
      <span>
        {currentPage} / {totalPages}
      </span>
      <button type="button">다음</button>
    </nav>
  )
}
