import { useEffect } from 'react'

// dependency가 바뀔 때마다 화면을 맨 위로 스크롤한다.
export const useScrollToTop = (dependency: unknown) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dependency])
}
