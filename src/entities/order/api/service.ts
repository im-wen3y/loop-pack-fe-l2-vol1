import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createOrder } from '@/entities/order/api/api'
import { orderQueries, orderQueryKeys } from '@/entities/order/api/queries'

export const useOrderListQuery = () => useQuery(orderQueries.list())

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    // 주문이 생기면 목록이 낡는다. 이동한 화면이 새로 받도록 무효화한다.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderQueryKeys.all }),
  })
}
