/**
 * 주문 가격 계산 컨트롤러
 * - calculateOrderPrice의 순수 함수들을 조합하여 최종 가격 정보를 반환
 * - 컴포넌트에서는 이 훅만 호출하면 모든 가격 파생값을 받을 수 있음
 */
import type { CartItem } from './types'
import {
  calculateItemTotal,
  calculateShippingFee,
  calculatePointDiscount,
  calculateFinalPrice,
} from './calculateOrderPrice'

type UseOrderPriceParams = {
  cartItems: CartItem[]
  isRemote: boolean
  couponDiscount: number
  usePoint: boolean
  pointInput: number
  memberPoint: number
  memberGrade: 'VIP' | 'NORMAL'
}

export const useOrderPrice = ({
  cartItems,
  isRemote,
  couponDiscount,
  usePoint,
  pointInput,
  memberPoint,
  memberGrade,
}: UseOrderPriceParams) => {
  const itemTotal = calculateItemTotal(cartItems)
  const shippingFee = calculateShippingFee(itemTotal, isRemote)
  const pointDiscount = usePoint ? calculatePointDiscount(pointInput, memberPoint, itemTotal) : 0
  const totalDiscount = couponDiscount + pointDiscount
  const subtotal = itemTotal + shippingFee - totalDiscount
  const finalPrice = calculateFinalPrice(subtotal, memberGrade)

  return {
    itemTotal,
    shippingFee,
    couponDiscount,
    pointDiscount,
    finalPrice,
  }
}
