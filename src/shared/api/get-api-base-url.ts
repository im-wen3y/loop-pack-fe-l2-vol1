// 클라이언트는 상대경로(`/api/...`)로 충분하지만, 서버(SSR·prefetch·generateMetadata)에는 기준
// origin이 없어 상대경로 fetch가 실패한다. 그래서 서버 분기만 절대 URL을 만든다.
//
// `NEXT_PUBLIC_` 접두사를 붙이면 안 된다. Next가 빌드 시점에 값을 클라이언트 번들에 박아 넣어
// 서버 내부 origin이 브라우저에 노출된다. scripts/validate-env.mjs가 이 규칙을 검사한다.
//
// 폴백은 두지 않는다. 폴백이 있으면 origin을 빠뜨려도 조용히 localhost로 흘러가, 로컬에서는
// 통과하고 배포 환경에서만 어긋난다.
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') return ''

  // 명시한 값이 이긴다. 커스텀 도메인을 쓰는 경우다.
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN

  // Vercel은 배포마다 URL이 달라 고정값을 넣을 수 없다. 프로토콜 없이 도메인만 담겨 온다.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  throw new Error(
    'APP_ORIGIN이 없습니다. 서버 렌더링이 API를 호출할 절대 origin이 필요합니다. ' +
      '로컬에서는 .env.local에 APP_ORIGIN=http://localhost:3000 을 추가하세요.',
  )
}
