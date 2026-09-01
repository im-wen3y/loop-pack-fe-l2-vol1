import { WishlistContent } from '@/_pages/wishlist/ui/WishlistContent'
import { Header } from '@/widgets/header'
import { PageContainer } from '@/shared/ui/PageContainer/PageContainer'
import '@/shared/styles/layout.css'

// h1은 Client 경계 밖에 둔다. 목록·홈과 같은 이유로 페이지가 소유한다.
export const WishlistPage = () => (
  <PageContainer>
    <Header />
    <section className="layout-section">
      <h1>위시리스트</h1>
      <WishlistContent />
    </section>
  </PageContainer>
)
