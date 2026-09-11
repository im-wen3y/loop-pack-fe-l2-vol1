import { appendFile } from 'node:fs/promises'

/*
 * build 전에 환경 변수 계약을 검사한다. 이 파일의 목록이 이 프로젝트의 설정 계약이다.
 *
 * 값은 어디에도 출력하지 않는다. 변수 이름과 사유만 쓴다. 실패 리포트가 secret 유출
 * 경로가 되면 게이트를 만든 의미가 없다.
 */

// 서버 렌더링이 API를 호출할 절대 origin. 없으면 app/layout.tsx의 metadataBase가 빌드 중에 죽는다.
const REQUIRED_URL_VARS = ['APP_ORIGIN']

// 브라우저에 나가면 안 되는 값들. NEXT_PUBLIC_ 접두사가 붙으면 Next가 빌드 시점에
// 클라이언트 번들에 문자열로 박아 넣는다(src/shared/api/get-api-base-url.ts 주석 참고).
const SERVER_ONLY_VARS = ['APP_ORIGIN', 'AUTH_SESSION_SECRET']

const checkRequiredUrl = (name) => {
  const raw = process.env[name]

  if (raw === undefined || raw.trim() === '') {
    return [
      `${name}이(가) 없습니다. 서버 렌더링이 API를 호출할 절대 origin이 필요합니다.`,
      `로컬에서는 .env.local에 ${name}=http://localhost:3000 을 추가하세요.`,
    ].join(' ')
  }

  let parsed
  try {
    parsed = new URL(raw)
  } catch {
    // 값을 그대로 싣지 않는다. 무엇이 잘못됐는지만 말한다.
    return `${name}이(가) 절대 URL이 아닙니다. http:// 또는 https:// 로 시작하는 origin이어야 합니다.`
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return `${name}의 프로토콜이 http/https가 아닙니다.`
  }

  return null
}

const checkNotExposed = (name) => {
  const exposed = `NEXT_PUBLIC_${name}`

  if (process.env[exposed] === undefined) return null

  return [
    `${exposed}이(가) 설정돼 있습니다. ${name}은(는) 서버 전용 값입니다.`,
    'NEXT_PUBLIC_ 접두사가 붙으면 빌드 시점에 클라이언트 번들로 값이 새어 나갑니다.',
  ].join(' ')
}

const collectFailures = () => [
  ...REQUIRED_URL_VARS.map(checkRequiredUrl),
  ...SERVER_ONLY_VARS.map(checkNotExposed),
]

const buildSummary = (failures) => {
  if (failures.length === 0) {
    const checked = [...new Set([...REQUIRED_URL_VARS, ...SERVER_ONLY_VARS])].join(', ')
    return `## ✅ 환경 변수 검증 통과\n\n검사 대상: \`${checked}\`\n\n`
  }

  return [
    '## ❌ 환경 변수 검증 실패',
    '',
    ...failures.map((reason) => `- ${reason}`),
    '',
    '값은 보안상 출력하지 않습니다. 설정 계약은 `scripts/validate-env.mjs`에 있습니다.',
    '',
  ].join('\n')
}

const main = async () => {
  const failures = collectFailures().filter((reason) => reason !== null)
  const summary = buildSummary(failures)

  process.stdout.write(summary)

  // 실패로 종료하기 전에 요약을 먼저 남긴다. 리포트가 필요한 순간이 바로 실패했을 때다.
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
  }

  if (failures.length > 0) {
    process.exitCode = 1
  }
}

await main()
