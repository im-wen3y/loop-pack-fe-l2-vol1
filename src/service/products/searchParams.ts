import { createSerializer, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs/server'
import type { CategoryId, ProductSort } from '@/types/commerce'

const CATEGORY_FILTERS = [
  'all',
  'casual',
  'fashion',
  'goods',
  'home',
  'digital',
] as const satisfies readonly (CategoryId | 'all')[]

const SORT_OPTIONS = [
  'latest',
  'popular',
  'price-asc',
  'price-desc',
] as const satisfies readonly ProductSort[]

// 카테고리·정렬·페이지처럼 "한 번의 명시적 변경"은 히스토리에 쌓아 뒤로/앞으로로 복원하게 한다.
// serializer(API 직렬화)는 history 옵션을 쓰지 않으므로 영향 없다.
const PUSH_HISTORY = { history: 'push' } as const

// URL 상태와 API 직렬화가 공유하는 단일 정의. useQueryStates(productListParsers)로도 쓴다.
export const productListParsers = {
  // 검색어는 debounce가 끝난 확정값만 반영되므로 글자마다가 아니라 검색 단위로 히스토리에 쌓인다.
  q: parseAsString.withDefault('').withOptions(PUSH_HISTORY),
  category: parseAsStringLiteral(CATEGORY_FILTERS).withDefault('all').withOptions(PUSH_HISTORY),
  sort: parseAsStringLiteral(SORT_OPTIONS).withDefault('latest').withOptions(PUSH_HISTORY),
  page: parseAsInteger.withDefault(1).withOptions(PUSH_HISTORY),
  pageSize: parseAsInteger.withDefault(12).withOptions(PUSH_HISTORY),
}

// clearOnDefault: false → 기본값(sort=latest 등)도 항상 요청에 포함한다. URL 상태는 기본 동작을 써서 주소창을 깔끔하게 유지한다.
export const serializeProductListQuery = createSerializer(productListParsers, {
  clearOnDefault: false,
})
