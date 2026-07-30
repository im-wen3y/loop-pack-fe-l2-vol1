import { useQueryStates } from 'nuqs'
/* eslint-disable-next-line boundaries/dependencies */
import { productListParsers } from '@/_pages/product-list/model/search-params'

export const usePagination = (totalCount: number, pageSize: number) => {
  const [{ page }, setParams] = useQueryStates(productListParsers)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const goToPage = (nextPage: number) => setParams({ page: nextPage })

  return { currentPage: page, totalPages, pageSize, goToPage }
}
