import { Suspense } from 'react'
import { HomeTabs } from './_components/HomeTabs'
import { SelectPreview } from './_components/SelectPreview'
import { DialogPreview } from './_components/DialogPreview'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Commerce</h1>
      <p className={styles.lead}>
        4주차부터 여기에 커머스를 쌓아갑니다. 이번 주는 디자인 시스템의 뼈대
        <b> Select</b>와 <b>Dialog</b>를 직접 만드는 것부터 시작해요.
      </p>
      <ul className={styles.list}>
        <li>
          컴포넌트 자리: <code>src/components/ui/select</code> ·{' '}
          <code>src/components/ui/dialog</code>
        </li>
        <li>
          mock 백엔드: <code>GET /api/products</code> (<code>src/app/api/products/route.ts</code>)
        </li>
        <li>
          과제 명세: <code>docs/assignments/week-04.md</code>
        </li>
      </ul>
      <p className={styles.note}>
        구조는 최소 골격만 있어요. 폴더 구성은 각자 근거를 대고 바꾸면 돼요.
      </p>

      <section className={styles.previewSection}>
        <h2 className={styles.previewTitle}>동작 확인</h2>
        <HomeTabs
          selectPanel={
            <Suspense fallback={<p className={styles.note}>불러오는 중...</p>}>
              <SelectPreview />
            </Suspense>
          }
          dialogPanel={<DialogPreview />}
        />
      </section>
    </main>
  )
}
