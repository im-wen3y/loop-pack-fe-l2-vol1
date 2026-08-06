import { getServerQueryClient } from '@/shared/api/query-client'
import { homeQueries } from '@/_pages/home/api/queries'
import styles from './HeroSection.module.css'

// Hero 카피만 홈 응답에 의존한다. Server Component에서 직접 읽어 정적 HTML로 내보내므로
// 클라이언트 번들과 hydration이 필요 없다.
//
// getServerQueryClient는 React cache로 감싸져 있어 같은 요청 안에서 HomeData와 같은
// QueryClient를 공유한다. 따라서 두 Suspense 경계가 각각 조회해도 /api/home 요청은 1회다.
// (같은 render/request의 동일 native fetch도 memoization 대상이라 방어가 이중이다.)
//
// 홈의 h1은 HomePage가 소유한다. banner.title은 응답에 딸린 섹션 제목이므로 h2로 둔다.
export const HeroCopy = async () => {
  const queryClient = getServerQueryClient()
  const { banner } = await queryClient.fetchQuery(homeQueries.detail())

  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>이번 주의 발견</p>
      <h2>{banner.title}</h2>
      <p>{banner.description}</p>
    </div>
  )
}
