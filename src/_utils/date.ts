const MS_PER_DAY = 1000 * 60 * 60 * 24

// ISO 날짜 문자열로부터 현재까지 지난 일수(내림)를 반환한다.
// 현재 시각(Date.now())에 의존하므로 호출 시점마다 결과가 달라질 수 있다.
export const getDaysSince = (isoDate: string): number => {
  const target = new Date(isoDate).getTime()
  return Math.floor((Date.now() - target) / MS_PER_DAY)
}
