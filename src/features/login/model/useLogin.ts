'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { sessionQueries } from '@/entities/session'
import { login } from '@/features/login/api/login'

// 로그인 성공을 세션 캐시에 그대로 반영한다. 응답의 user가 /api/auth/me와 같은 모양이라
// 다시 물어볼 이유가 없다.
//
// 여기서 setOwner를 직접 부르지 않는다. 세션이 바뀌면 소유자를 맞추는 일은
// _app의 useSyncCollectionOwner 한 곳이 맡는다 — 로그인만 그 일을 하면
// 새로고침한 브라우저가 자기 목록을 잃는다(실제로 그랬다).
//
// 로그인 401은 전역 만료 처리로 보내지 않는다. 자격 증명 오류라 폼이 인라인으로 보여줘야 하고,
// 전역 핸들러가 잡으면 비밀번호를 틀렸을 때 /login에서 /login으로 리다이렉트한다.
export const useLogin = (returnPath: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(sessionQueries.me().queryKey, user)
      // 로그인 화면이 히스토리에 남으면 복원한 화면에서 뒤로 가기가 로그인으로 돌아온다.
      router.replace(returnPath)
    },
  })

  return { login: mutate, isPending, error }
}
