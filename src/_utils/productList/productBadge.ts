import { getDaysSince } from '../date'

// 상품 뱃지·배송 표시를 결정하는 도메인 규칙들. 모두 원시값만 받는 순수 함수라
// 컴포넌트 밖에서 단위 테스트할 수 있다.

const NEW_PRODUCT_DAYS = 7 // 등록 후 며칠까지 'NEW'로 볼지
const ALMOST_SOLD_OUT_STOCK = 5 // 재고가 몇 개 이하일 때 '품절 임박'인지
const HOT_DEAL_DISCOUNT_RATE = 30 // 할인율 몇 % 이상일 때 '특가'인지
const BEST_RATING = 4.5 // 'BEST' 기준 평점
const BEST_REVIEW_COUNT = 100 // 'BEST' 기준 리뷰 수
const FREE_SHIPPING_PRICE = 50000 // 무료배송 최소 금액

// 정가 대비 할인율(%)을 정수로 반환한다. 정가가 없으면 0.
export const getDiscountRate = (price: number, originalPrice?: number): number =>
  originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0

export const isSoldOut = (stock: number): boolean => stock === 0

export const isAlmostSoldOut = (stock: number): boolean =>
  stock > 0 && stock <= ALMOST_SOLD_OUT_STOCK

export const isNewProduct = (createdAt: string): boolean =>
  getDaysSince(createdAt) <= NEW_PRODUCT_DAYS

export const isHotDeal = (discountRate: number): boolean => discountRate >= HOT_DEAL_DISCOUNT_RATE

export const isBestProduct = (rating: number, reviewCount: number): boolean =>
  rating >= BEST_RATING && reviewCount >= BEST_REVIEW_COUNT

export const hasFreeShipping = (price: number): boolean => price >= FREE_SHIPPING_PRICE
