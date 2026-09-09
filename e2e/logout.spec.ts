import { expect } from '@playwright/test'
import { accountMenu } from './fixtures/login-actions'
import { test as authenticatedTest } from './fixtures/worker-auth'

authenticatedTest('로그아웃 실패 시 팝오버 밖 오류 배너를 유지한다', async ({ page, account }) => {
  await page.route('**/api/auth/logout', (route) =>
    route.fulfill({
      status: 500,
      body: '',
    }),
  )

  await page.goto('/')
  const currentUrl = page.url()

  await accountMenu(page, account).click()
  await page.getByRole('button', { name: '로그아웃' }).click()

  const alert = page.getByRole('alert')
  await expect(alert).toContainText('로그아웃에 실패했습니다. 다시 시도해 주세요.')
  expect(page.url()).toBe(currentUrl)

  await accountMenu(page, account).click()
  await expect(alert).toBeVisible()

  await page.getByRole('button', { name: '로그아웃 오류 닫기' }).click()
  await expect(alert).toHaveCount(0)
})
