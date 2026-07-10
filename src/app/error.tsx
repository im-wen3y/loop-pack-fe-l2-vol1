'use client'

import styles from './page.module.css'

/*
 * mock API 실패(catalog.ts의 fetchApi)가 랜딩 페이지(SelectPreview)의 Server Component
 * 렌더 중에 일어날 수 있어, 라우트 루트에 에러 바운더리를 둔다.
 */
const RootError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <main className={styles.page}>
    <h1 className={styles.title}>문제가 발생했어요</h1>
    <p className={styles.lead}>mock API 응답을 불러오지 못했습니다.</p>
    <button type="button" onClick={() => reset()}>
      다시 시도
    </button>
  </main>
)

export default RootError
