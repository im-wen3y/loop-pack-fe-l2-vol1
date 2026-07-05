import type { GetProductListResponse, GetProductListParams } from './model'

/**
 * 상품 목록 조회.
 *
 * ⚠️ axios가 아닌 상대경로 `fetch`를 쓰는 이유
 * ------------------------------------------------------------------
 * mock(`installMockApi`)은 `window.fetch`를 가로채되, `url.startsWith('/api/products')`
 * 처럼 **상대경로 prefix**로만 매칭한다. (스타터 파일이라 수정 불가)
 *
 * axios의 fetch 어댑터는 요청을 `Request` 객체로 감싸는데, `Request` 생성자가 상대경로를
 * document base 기준 **절대 URL**(`http://localhost:5173/api/products?...`)로 정규화한다.
 * 그 결과 mock의 `input.url`은 절대경로가 되어 `startsWith('/api/products')`가 false가 되고,
 * mock 분기를 타지 못한 채 실제 네트워크로 새어나가 목록이 로드되지 않았다.
 *
 * → 상대경로 문자열을 그대로 넘기는 `fetch`를 쓰면 `input`이 문자열이라 상대경로가 유지되어
 *   mock이 정상적으로 가로챈다.
 */
export const getProductList = async (
  params: GetProductListParams,
): Promise<GetProductListResponse> => {
  const searchParams = new URLSearchParams(params)

  const response = await fetch(`/api/products?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error(`상품 목록을 불러오지 못했습니다 (status: ${response.status})`)
  }

  return response.json() as Promise<GetProductListResponse>
}
