import { Suspense } from 'react'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { homeQueries } from '@/_pages/home/api/queries'
import { getServerQueryClient } from '@/shared/api/query-client'
import { HomeContent } from '@/_pages/home/ui/HomeContent'
import { HomeContentSkeleton } from '@/_pages/home/ui/HomeContentSkeleton'
import { HeroSection } from '@/_pages/home/ui/HeroSection'
import { HeroCopy } from '@/_pages/home/ui/HeroCopy'
import { HeroCopySkeleton } from '@/_pages/home/ui/HeroCopySkeleton'
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
// Header와 h1까지 홈 데이터를 기다린다(Before 측정: h1이 566.0ms에야 등장).
//
// Suspense 경계가 둘인 이유는 Hero의 데이터 소유권이 갈리기 때문이다.
// <img>의 src는 정적 경로라 대기가 필요 없고, 카피(title·description)만 홈 응답에 딸려 있다.
// HeroSection 껍데기와 이미지를 첫 flush로 내보내고 카피만 스트리밍하면
// 이미지가 홈 API를 기다리지 않는다. .copy는 .hero 안에서 absolute라 교체해도 아래가 밀리지 않는다.
//
// 두 경계가 각각 홈 데이터를 조회하지만 getServerQueryClient가 요청 단위로 같은 QueryClient를
// 돌려주므로 /api/home 요청은 1회다.
//
// 라우트 레벨 loading.tsx는 두지 않는다. 이 Suspense와 중복이라 초기 HTML에
// Header·h1이 두 벌 실려 명세가 요구하는 "하나의 h1"이 깨졌다.
// (라우트 세그먼트 설정 dynamic = 'force-dynamic'은 라우팅 파일 app/(home)/page.tsx가 소유한다.)
export const HomePage = () => (
  <PageContainer>
    <Header />
    <h1 className="visually-hidden">취향을 발견하는 라이프스타일 스토어</h1>
    <HeroSection>
      <Suspense fallback={<HeroCopySkeleton />}>
        <HeroCopy />
      </Suspense>
    </HeroSection>
    <Suspense fallback={<HomeContentSkeleton />}>
      <HomeData />
    </Suspense>
  </PageContainer>
)
