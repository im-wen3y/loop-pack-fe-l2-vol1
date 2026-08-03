// product 슬라이스의 Public API. 상품 도메인 타입과 목록 조회 계약을 공개한다.
// 상품 표현 UI는 찜·담기 feature를 조합하는 widgets/product-card가 소유한다.
export type { Category, CategoryId } from '@/entities/product/model/category'
export type { Product, ProductSort } from '@/entities/product/model/product'

// 목록 조회는 여러 화면이 같은 캐시를 공유해야 하므로 queryOptions를 공개한다.
// fetch 구현(api.ts)과 요청 직렬화(query-schema.ts의 serializer)는 숨긴다.
export { productQueries, productQueryKeys } from '@/entities/product/api/queries'
export { useProductListQuery } from '@/entities/product/api/service'
export {
  PRODUCT_PAGE_SIZE,
  type GetProductListParams,
  type GetProductListResponse,
} from '@/entities/product/api/model'

// 조회 파라미터 스키마. 화면은 이 parser 위에 자기 URL 동작(히스토리 등)만 얹는다.
// 정렬 UI가 실제로 참조하는 허용값 목록만 외부 계약으로 공개한다.
export { PRODUCT_SORT_VALUES, productListQueryParsers } from '@/entities/product/api/query-schema'
