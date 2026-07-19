import { useQuery } from '@tanstack/react-query'
import { productQuery } from '@/api/products/queries'
import type { GetProductListParams } from '@/api/products/model'

export const useGetProductList = (params: GetProductListParams) =>
  useQuery(productQuery.list(params))
