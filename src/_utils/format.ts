// 숫자 가격을 천 단위 구분 + '원' 문자열로 만든다. (예: 289000 → "289,000원")
export const formatPrice = (price: number): string => `${price.toLocaleString()}원`
