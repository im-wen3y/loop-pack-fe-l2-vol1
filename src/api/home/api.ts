import type { GetHomeResponse } from '@/api/home/model'

export const getHome = async (): Promise<GetHomeResponse> => {
  const response = await fetch('/api/home')
  if (!response.ok) {
    throw new Error(`홈 정보를 불러오지 못했습니다 (status: ${response.status})`)
  }

  const data: GetHomeResponse = await response.json()
  return data
}
