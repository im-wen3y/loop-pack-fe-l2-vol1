import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { homeQueries } from '@/_pages/home/api/queries'
import { getServerQueryClient } from '@/shared/api/query-client'
import { HomeContent } from '@/_pages/home/ui/HomeContent'
import { HomeContentSkeleton } from '@/_pages/home/ui/HomeContentSkeleton'
import { Header } from '@/widgets/header'
import { PageContainer } from '@/shared/ui/PageContainer/PageContainer'
import '@/shared/styles/layout.css'

// Server Component: 클라이언트와 동일한 queryOptions(homeQueries.detail)로 서버에서 미리 조회하고,
// dehydrate로 캐시를 직렬화해 HydrationBoundary로 클라이언트에 넘긴다.
// 덕분에 useSuspenseHomeQuery가 클라이언트에서 재요청 없이 확정 데이터를 읽어 SSR 결과가 그대로 나온다.
const HomeData = async () => {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(homeQueries.detail())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeContent />
    </HydrationBoundary>
  )
}

// HomePage 자체는 async가 아니다. async로 두면 return 전체가 prefetch await 뒤로 밀려
// Header와 h1까지 홈 데이터를 기다린다(Before 측정: h1이 547ms에야 등장).
// 기다리는 부분만 HomeData로 내려 Suspense 안에 두고, Header·h1은 첫 flush로 내보낸다.
//
// 라우트 레벨 loading.tsx는 두지 않는다. 이 Suspense와 중복이라 초기 HTML에
// Header·h1이 두 벌 실려 명세가 요구하는 "하나의 h1"이 깨졌다.
// (라우트 세그먼트 설정 dynamic = 'force-dynamic'은 라우팅 파일 app/(home)/page.tsx가 소유한다.)
export const HomePage = () => (
  <PageContainer>
    <Header />
    <h1 className="visually-hidden">취향을 발견하는 라이프스타일 스토어</h1>
    <Suspense fallback={<HomeContentSkeleton />}>
      <HomeData />
    </Suspense>
  </PageContainer>
)
