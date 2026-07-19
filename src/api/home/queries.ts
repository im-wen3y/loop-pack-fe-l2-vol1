import { queryOptions } from '@tanstack/react-query'
import { getHome } from '@/api/home/api'

export const homeQueryKeys = {
  all: ['home'] as const,
}

export const homeQuery = {
  detail: () =>
    queryOptions({
      queryKey: homeQueryKeys.all,
      queryFn: getHome,
      // ponytail: 배너·카테고리 위주라 자주 바뀌지 않는다. staleTime은 정책 값이니 필요하면 조정한다.
      staleTime: 5 * 60 * 1000,
    }),
}
