// 검색어를 정규식에 안전하게 넣기 위한 escape (특수문자로 인한 RegExp 크래시 방지)
export const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export type HighlightSegment = {
  text: string
  isMatch: boolean
}

// text를 query 기준으로 잘라 각 조각이 검색어와 일치하는지(isMatch) 표시한다.
// 대소문자를 구분하지 않으며, query가 비어 있으면 전체를 비-매치 한 조각으로 반환한다.
// JSX(<mark> 등)는 만들지 않는다 — 렌더링은 호출부(컴포넌트) 책임.
export const getHighlightSegments = (text: string, query: string): HighlightSegment[] => {
  if (!query) return [{ text, isMatch: false }]

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
  return parts
    .filter((part) => part !== '')
    .map((part) => ({ text: part, isMatch: part.toLowerCase() === query.toLowerCase() }))
}
