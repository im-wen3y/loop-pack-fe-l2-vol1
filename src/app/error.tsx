'use client'

import styles from './page.module.css'

/*
 * SelectPreview의 mock API 실패는 SelectPreviewBoundary(컴포넌트 단위)가 먼저 잡아서
 * Dialog 탭까지 함께 무너지지 않게 막는다. 이 라우트 루트 error.tsx는 그걸로도 못 잡는,
 * 페이지의 다른 부분(레이아웃/그 외 렌더)에서 나는 예기치 못한 에러를 위한 마지막 안전망이다.
 */
const RootError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <main className={styles.page}>
    <h1 className={styles.title}>문제가 발생했어요</h1>
    <p className={styles.lead}>페이지를 표시하는 중 오류가 발생했습니다.</p>
    <button type="button" onClick={() => reset()}>
      다시 시도
    </button>
  </main>
)

export default RootError
