import { useEffect, useState } from 'react'

// 값이 delayMs 동안 더 이상 바뀌지 않을 때만 최신값을 반영한다.
export const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}
