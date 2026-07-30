// product-card 슬라이스의 Public API. 카드 하나만 공개하고, 안에서 찜·담기 행위까지 완결한다.
// ProductCardActions와 useProductCardActions는 이 카드의 구현 세부라 밖으로 열지 않는다.
export { ProductCard } from '@/features/product-card/ui/ProductCard'
export type { ProductCardItem } from '@/features/product-card/model/types'
