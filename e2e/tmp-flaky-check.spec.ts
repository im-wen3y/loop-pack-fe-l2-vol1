import { expect, test } from '@playwright/test'

/*
 * 실험용. 재시도 정책과 아티팩트 업로드가 실제로 동작하는지 확인하려고 첫 시도만
 * 결정적으로 실패시킨다. testInfo.retry는 0부터 시작하므로 첫 시도에서만 던진다.
 *
 * 확인 대상
 * 1. CI에서 재시도가 실제로 도는지, 리포트에 flaky로 남는지
 * 2. 실패 시 test-results 아티팩트가 올라오는지
 * 3. 재시도로 통과했을 때 첫 실패 시도의 trace가 보존되는지
 *
 * 확인 후 브랜치와 함께 삭제한다. 머지 금지.
 */
test('첫 시도만 실패시켜 재시도와 아티팩트를 확인한다', async ({ page }, testInfo) => {
  await page.goto('/products')
  await expect(page.getByRole('textbox', { name: '검색' })).toBeVisible()

  if (testInfo.retry === 0) {
    throw new Error('의도적인 첫 시도 실패 - 재시도와 아티팩트 확인용')
  }
})
