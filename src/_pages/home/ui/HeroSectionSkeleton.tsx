import styles from './HeroSection.module.css'

// 실제 Hero와 같은 .hero·.copy 박스를 그대로 쓴다. aspect-ratio가 같아 교체 시 layout shift가 없다.
export const HeroSectionSkeleton = () => (
  <section className={`${styles.hero} ${styles.skeleton}`} aria-hidden="true">
    <div className={styles.copy}>
      <span className={styles.skeletonEyebrow} />
      <span className={styles.skeletonTitle} />
      <span className={styles.skeletonDescription} />
    </div>
  </section>
)
