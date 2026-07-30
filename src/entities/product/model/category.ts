// 카테고리는 상품을 분류하고 조회 조건을 표현하는 값으로만 쓰인다. 전용 API·상태·화면이
// 없어 별도 entity로 분리하지 않고 product 슬라이스가 소유한다.
// 분리를 재검토할 조건은 docs/week-06/entity-decisions.md에 적어뒀다.
export type CategoryId = 'casual' | 'fashion' | 'goods' | 'home' | 'digital'

export type Category = {
  id: CategoryId
  name: string
}
