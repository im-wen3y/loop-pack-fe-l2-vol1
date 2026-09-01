import { queryOptions } from '@tanstack/react-query'
import { getOrderList } from '@/entities/order/api/api'

export const orderQueryKeys = {
  all: ['order'] as const,
  list: () => [...orderQueryKeys.all, 'list'] as const,
}

export const orderQueries = {
  list: () =>
    queryOptions({
      queryKey: orderQueryKeys.list(),
      queryFn: ({ signal }) => getOrderList(signal),
      // 주문은 사용자가 방금 만든 것이 바로 보여야 한다. 상품 목록과 달리 캐시를 오래 두지 않는다.
      staleTime: 0,
    }),
}
