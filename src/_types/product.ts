// 도메인 타입 — UI·로직 등 앱 전반에서 공유한다.
// API 요청/응답 타입(DTO)은 서버 계약이므로 여기 두지 않고 _apis에 colocate.

export type Product = {
  id: number
  name: string
  category: 'electronics' | 'fashion' | 'home' | 'beauty'
  price: number
  originalPrice?: number
  stock: number
  imageUrl: string
  createdAt: string
  rating: number
  reviewCount: number
}

export type SortBy = 'latest' | 'popular' | 'price-asc' | 'price-desc'

export const SORT_BY_VALUES: readonly SortBy[] = ['latest', 'popular', 'price-asc', 'price-desc']

export type ViewMode = 'grid' | 'list'

// 'all'은 필터 UI의 "전체" 옵션 — 도메인 category에 존재하지 않는 UI 전용 값
export type CategoryFilter = 'all' | Product['category']

export const CATEGORY_FILTER_VALUES: readonly CategoryFilter[] = [
  'all',
  'electronics',
  'fashion',
  'home',
  'beauty',
]
