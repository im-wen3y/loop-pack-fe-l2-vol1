// 장바구니에 담긴 한 줄. 주문 API가 요구하는 형태(`{ productId, quantity }`)와 같다.
// quantity는 1 이상의 정수다. 0으로 내리는 것은 수량 변경이 아니라 제거로 다룬다.
export type CartItem = {
  productId: string
  quantity: number
}
