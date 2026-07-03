import { useEffect, useState } from 'react'

// localStorage에 동기화되는 useState. 초기값은 lazy로 한 번만 읽고,
// 값이 바뀔 때마다 다시 저장한다. localStorage 접근이 막힌 환경(SSR·프라이빗 모드 등)에서는
// 조용히 initialValue로 폴백한다.
export const useLocalStorageState = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [key, value])

  return [value, setValue] as const
}
