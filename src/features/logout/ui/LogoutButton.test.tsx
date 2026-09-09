import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { LogoutButton } from '@/features/logout/ui/LogoutButton'
import { renderWithProviders } from '@/shared/test/render-with-providers'
import { server } from '@/shared/test/msw-server'

vi.mock('@/analytics/logger', () => ({
  reset: vi.fn(),
  track: vi.fn(),
}))

describe('LogoutButton', () => {
  it('로그아웃 요청이 실패하면 이동하지 않고 실패 사유를 표시한다', async () => {
    const user = userEvent.setup()
    const currentUrl = window.location.href
    server.use(http.post('/api/auth/logout', () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<LogoutButton />)
    await user.click(screen.getByRole('button', { name: '로그아웃' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('로그아웃하지 못했습니다.')
    expect(window.location.href).toBe(currentUrl)
  })
})
