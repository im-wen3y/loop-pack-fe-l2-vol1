import { useQuery } from '@tanstack/react-query'
import type { GetProductListParams } from '../../_apis/product/model'
import { productQuery } from './queries'

export const useGetProductList = (params: GetProductListParams) =>
  useQuery(productQuery.list(params))
