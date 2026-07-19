import { createSerializer, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs'
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

// URL 상태와 API 직렬화가 공유하는 단일 정의. useQueryStates(productListParsers)로도 쓴다.
export const productListParsers = {
  q: parseAsString.withDefault(''),
  category: parseAsStringLiteral(CATEGORY_FILTERS).withDefault('all'),
  sort: parseAsStringLiteral(SORT_OPTIONS).withDefault('latest'),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(12),
}

// clearOnDefault: false → 기본값(sort=latest 등)도 항상 요청에 포함한다. URL 상태는 기본 동작을 써서 주소창을 깔끔하게 유지한다.
export const serializeProductListQuery = createSerializer(productListParsers, {
  clearOnDefault: false,
})
