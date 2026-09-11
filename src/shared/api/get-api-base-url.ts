// 클라이언트는 상대경로(`/api/...`)로 충분하다.
// 서버(SSR·prefetch·generateMetadata)에는 기준 origin이 없어 상대경로 fetch가 실패하므로 절대 URL이 필요하다.
//
// origin은 서버 분기에서만 쓰므로 `NEXT_PUBLIC_` 접두사를 붙이지 않는다. 접두사가 붙으면 Next가
// 빌드 시점에 그 값을 클라이언트 번들에 문자열로 박아 넣는데, 클라이언트 분기는 빈 문자열을 반환해
// 값을 쓰지 않는다. 쓰지도 않는 값이 번들에 남고, 배포 환경에서는 서버 내부 origin이 브라우저에
// 그대로 노출된다.
//
// 10주차에 `http://localhost:${PORT}` 폴백을 걷어냈다(5주차 docs/rfc 기록의 판단을 바꾼 것).
// 폴백이 있으면 origin을 잘못 설정하거나 빠뜨려도 조용히 localhost로 흘러간다. 로컬에서는 통과하고
// 배포 환경에서만 엉뚱한 곳을 가리키는, 설정 사고 중 가장 늦게 발견되는 형태다.
// 지금은 scripts/validate-env.mjs가 build 전에 막고, 여기서도 명시적으로 던진다.
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') return ''

  const origin = process.env.APP_ORIGIN
  if (origin === undefined || origin === '') {
    throw new Error(
      'APP_ORIGIN이 없습니다. 서버 렌더링이 API를 호출할 절대 origin이 필요합니다. ' +
        '로컬에서는 .env.local에 APP_ORIGIN=http://localhost:3000 을 추가하세요.',
    )
  }

  return origin
}
