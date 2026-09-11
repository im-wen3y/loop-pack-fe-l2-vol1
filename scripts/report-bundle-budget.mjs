import { readFile, appendFile } from 'node:fs/promises'

/*
 * size-limit --json 결과를 job summary로 옮긴다.
 * 로그를 열지 않아도 PR 화면에서 측정값·한도·초과량을 볼 수 있게 하는 것이 목적이다.
 *
 * 초과로 size-limit이 실패해도 이 스크립트는 실행돼야 한다. 그래서 워크플로에서
 * 이 step의 조건을 "앞 step이 성공했을 때"가 아니라 "측정이 실행됐을 때"로 둔다.
 */
const RESULT_PATH = process.argv[2] ?? 'size-limit-result.json'

const formatKb = (bytes) => `${(bytes / 1000).toFixed(2)} kB`

const buildSummary = (entries) => {
  const failed = entries.filter((entry) => !entry.passed)
  const heading = failed.length === 0 ? '## ✅ 번들 예산 통과' : '## ❌ 번들 예산 초과'

  const rows = entries.map((entry) => {
    const diff = entry.size - entry.sizeLimit
    const state = entry.passed ? `여유 ${formatKb(-diff)}` : `**초과 ${formatKb(diff)}**`
    return `| ${entry.name} | ${formatKb(entry.size)} | ${formatKb(entry.sizeLimit)} | ${state} |`
  })

  return [
    heading,
    '',
    '| 대상 | 측정값 | 한도 | 결과 |',
    '| --- | ---: | ---: | ---: |',
    ...rows,
    '',
    '측정은 gzip 기준이다. 임계값 근거는 `docs/week-10/budget-gate.html` 09절에 있다.',
    '',
  ].join('\n')
}

// 같은 PR에 코멘트가 쌓이지 않도록 이 표식으로 기존 코멘트를 찾아 갱신한다.
const COMMENT_MARKER = '<!-- bundle-budget-report -->'

const readEventPayload = async () => {
  if (!process.env.GITHUB_EVENT_PATH) return null
  try {
    return JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'))
  } catch {
    return null
  }
}

/*
 * job summary는 Checks 탭을 눌러 들어가야 보인다. 초과를 PR 대화 화면에서 바로 보려면
 * 코멘트가 필요하다. 실패해도 리포트 자체를 망치지 않도록 조용히 넘긴다 —
 * fork PR에서는 GITHUB_TOKEN이 읽기 전용이라 코멘트를 쓸 수 없다.
 */
const upsertPullRequestComment = async (body) => {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPOSITORY
  if (!token || !repo) return 'skipped: 토큰 또는 저장소 정보 없음'

  const event = await readEventPayload()
  const prNumber = event?.pull_request?.number
  if (prNumber === undefined) return 'skipped: pull_request 이벤트가 아님'

  const api = `https://api.github.com/repos/${repo}`
  const headers = {
    'authorization': `Bearer ${token}`,
    'accept': 'application/vnd.github+json',
    'content-type': 'application/json',
  }
  const payload = JSON.stringify({ body: `${COMMENT_MARKER}\n${body}` })

  try {
    const listed = await fetch(`${api}/issues/${prNumber}/comments?per_page=100`, { headers })
    if (!listed.ok) return `skipped: 코멘트 조회 실패 (${listed.status})`

    const existing = (await listed.json()).find((comment) =>
      comment.body?.startsWith(COMMENT_MARKER),
    )
    const target = existing
      ? `${api}/issues/comments/${existing.id}`
      : `${api}/issues/${prNumber}/comments`

    const written = await fetch(target, {
      method: existing ? 'PATCH' : 'POST',
      headers,
      body: payload,
    })
    if (!written.ok) return `skipped: 코멘트 쓰기 실패 (${written.status})`

    return existing ? '기존 코멘트 갱신' : '새 코멘트 작성'
  } catch (error) {
    return `skipped: ${error instanceof Error ? error.message : String(error)}`
  }
}

const main = async () => {
  let entries
  try {
    entries = JSON.parse(await readFile(RESULT_PATH, 'utf8'))
  } catch (error) {
    // 측정 자체가 산출물을 남기지 못한 경우다. 요약에 그 사실을 적고 조용히 넘어가지 않는다.
    const message = error instanceof Error ? error.message : String(error)
    const fallback = `## ⚠️ 번들 예산 측정 결과를 읽지 못함\n\n\`${RESULT_PATH}\`를 읽을 수 없다: ${message}\n\n`
    process.stdout.write(fallback)
    if (process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(process.env.GITHUB_STEP_SUMMARY, fallback)
    }
    return
  }

  const summary = buildSummary(entries)
  process.stdout.write(summary)

  // 번들 초과는 job을 실패시키지 않는다(quality.yml의 continue-on-error). 그래서 check는
  // 초록불로 남는데, 그것만으로는 초과를 놓치기 쉽다. 주석으로 PR 화면에 띄운다.
  for (const entry of entries.filter((candidate) => !candidate.passed)) {
    const over = formatKb(entry.size - entry.sizeLimit)
    process.stdout.write(
      `::warning title=번들 예산 초과::${entry.name}이(가) 한도를 ${over} 넘었습니다 ` +
        `(${formatKb(entry.size)} / ${formatKb(entry.sizeLimit)})\n`,
    )
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary)
  }

  const commentResult = await upsertPullRequestComment(summary)
  process.stdout.write(`PR 코멘트: ${commentResult}\n`)
}

await main()
