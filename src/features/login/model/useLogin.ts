'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(sessionQueries.me().queryKey, user)
      // Header는 서버가 쿠키를 읽어 로그인 상태를 초기 HTML에 반영한다. 클라이언트 라우터로
      // 이동하면 이전에 받아 둔 공개 화면의 RSC 결과가 재사용되어 Header만 미로그인 상태로
      // 남을 수 있으므로, 새 문서를 받아 서버 세션과 화면을 한 번에 맞춘다.
      // replace를 써 로그인 화면은 히스토리에 남기지 않는다.
      window.location.replace(returnPath)
    },
  })

  return { login: mutate, isPending, error }
}
