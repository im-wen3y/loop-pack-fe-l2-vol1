import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

describe('HeroSection', () => {
  it('renders the existing banner contract as a stable hero', async () => {
    const { HeroSection } = await import('./HeroSection')

    const markup = renderToStaticMarkup(
      <HeroSection
        title="매일 새롭게 발견하는 취향"
        description="지금 가장 사랑받는 상품을 만나보세요."
      />,
    )

    expect(markup).toContain('매일 새롭게 발견하는 취향')
    expect(markup).toContain('지금 가장 사랑받는 상품을 만나보세요.')
    expect(markup).toContain('src="/images/week-07/hero-original.jpg"')
    expect(markup).toContain('width="3840"')
    expect(markup).toContain('height="2160"')
  })

  // 홈의 h1은 홈 데이터를 기다리지 않는 HomePage가 소유한다.
  // Hero가 다시 h1을 들고 오면 홈에 h1이 둘이 되므로 h2로 고정한다.
  it('renders the banner title as h2 so the shell keeps the only h1', async () => {
    const { HeroSection } = await import('./HeroSection')

    const markup = renderToStaticMarkup(
      <HeroSection title="매일 새롭게 발견하는 취향" description="설명" />,
    )

    expect(markup).toContain('<h2 id="hero-title">매일 새롭게 발견하는 취향</h2>')
    expect(markup).not.toContain('<h1')
  })
})
