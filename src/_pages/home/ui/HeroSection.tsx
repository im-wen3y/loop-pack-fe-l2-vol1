import type { GetHomeResponse } from '@/_pages/home/api/model'
import styles from './HeroSection.module.css'

// 7주차 starter가 제공한 Hero다. 고용량 원본(3840×2160, 약 7.5MB)을 그대로 요청하는 상태가
// 0단계 Before 측정의 기준선이라, 여기서는 포맷·크기·우선순위를 최적화하지 않는다.
type HeroSectionProps = Pick<GetHomeResponse['banner'], 'title' | 'description'>

export const HeroSection = ({ title, description }: HeroSectionProps) => {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {/* eslint-disable-next-line @next/next/no-img-element -- Week 7 intentionally starts with an unoptimized LCP image. */}
      <img
        className={styles.image}
        src="/images/week-07/hero-original.jpg"
        alt=""
        width={3840}
        height={2160}
      />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>이번 주의 발견</p>
        {/* 홈의 h1은 홈 데이터를 기다리지 않는 HomePage가 소유한다.
            banner.title은 응답에 딸린 섹션 제목이므로 h2로 둔다. */}
        <h2 id="hero-title">{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  )
}
