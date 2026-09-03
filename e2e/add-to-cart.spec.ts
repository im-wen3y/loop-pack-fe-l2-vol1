import { expect, test } from './fixtures/worker-auth'
import { CART_TEST_PRODUCT, productListPath } from './fixtures/test-products'

// 담기 성공의 결과는 헤더 개수가 아니라 장바구니 화면에 상품이 나타나는 것으로 정했다
// (docs/rfc/week09-e2e-scope.md §C). 그래서 확인 창을 거쳐 화면을 옮기는 데까지를 본다.
test('담은 상품이 확인 창을 거쳐 장바구니 화면에 나타난다', async ({ page }) => {
  await page.goto(productListPath(CART_TEST_PRODUCT))

  await page.getByRole('button', { name: `${CART_TEST_PRODUCT.name} 장바구니` }).click()

  const confirmDialog = page.getByRole('dialog')
  await expect(confirmDialog).toBeVisible()
  await expect(confirmDialog).toContainText('장바구니 페이지로 이동하겠습니까?')

  await confirmDialog.getByRole('button', { name: '장바구니 이동' }).click()

  await page.waitForURL('**/cart')
  await expect(page.getByRole('heading', { name: CART_TEST_PRODUCT.name })).toBeVisible()
})
