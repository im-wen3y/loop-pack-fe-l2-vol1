import { cookies } from 'next/headers'
import { getSession } from '@/entities/session'
import { HeaderNav } from '@/widgets/header/HeaderNav'

// 세션을 서버에서 읽어 초기 HTML에 로그인 상태를 담는다(docs/week-09/decisions.md 6번).
// Suspense로 흘려보내지 않는다 — 명세가 "JS 실행 전에도 로그인 여부가 보인다"를 요구해서,
// 스트리밍하면 헤더가 나중에 붙어 그 요구와 부딪힌다.
// 대신 이 헤더를 쓰는 모든 화면의 서버 렌더가 /api/auth/me의 500ms만큼 밀린다.
// 감수하기로 한 비용이고, 얼마나 밀리는지는 아직 측정하지 않았다.
//
// async 경계를 이 컴포넌트로 좁혀, 쓰는 쪽 페이지는 async가 되지 않는다.
// 페이지를 async로 만들면 return 전체가 await 뒤로 밀려 h1까지 세션을 기다린다
// (HomePage.tsx에 같은 실수가 기록되어 있다).
//
// cookies()를 여기서 읽는 것은 entities/session이 클라이언트 번들에도 들어가는 모듈이라
// next/headers를 품을 수 없기 때문이다. 쿠키를 읽는 일은 서버 호출자가 한다.
// cookies()를 부르면 이 헤더를 쓰는 라우트가 동적이 된다.
export const Header = async () => {
  const cookieHeader = (await cookies()).toString()
  const user = await getSession(cookieHeader)

  return <HeaderNav user={user} />
}
