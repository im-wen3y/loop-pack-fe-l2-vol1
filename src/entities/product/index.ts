// product 슬라이스의 Public API. 상품 도메인 타입만 공개한다.
// 상품 표현 UI는 찜·담기 feature를 조합하는 widgets/product-card가 소유한다.
export type { Category, CategoryId } from '@/entities/product/model/category'
export type { Product, ProductSort } from '@/entities/product/model/product'
