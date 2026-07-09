import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { TextOptionSelect, type TextSelectOption } from '@/components/ui/select/TextOptionSelect'
import { SizeOptionSelect, type SizeSelectOption } from '@/components/ui/select/SizeOptionSelect'
import {
  ThumbnailOptionSelect,
  type ThumbnailSelectOption,
} from '@/components/ui/select/ThumbnailOptionSelect'
import styles from './page.module.css'

type Product = {
  id: string
  name: string
  image: string
  price: number
  discountRate?: number
  badge?: string
  bundleBadge?: string
  stock: number
}

/*
 * Server Component의 fetch는 브라우저처럼 현재 origin을 암묵적으로 붙여주지 않아서
 * 상대 경로('/api/...')를 그대로 넘기면 실패한다 — headers()로 요청받은 host를 읽어
 * 절대 URL을 직접 구성한다.
 */
const fetchApi = async <T,>(path: string): Promise<T> => {
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = host?.startsWith('localhost') ? 'http' : 'https'
  const res = await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' })
  return res.json()
}

const getProducts = () =>
  fetchApi<{ products: Product[] }>('/api/products').then((data) => data.products)

const getSizes = () =>
  fetchApi<{ sizes: SizeSelectOption[] }>('/api/sizes').then((data) => data.sizes)

const getPurchaseOptions = () =>
  fetchApi<{ options: TextSelectOption[] }>('/api/purchase-options').then((data) => data.options)

type SelectDocSectionProps = {
  name: string
  description: string
  usage: string
  children: ReactNode
}

/*
 * 컴포넌트 3개를 한 줄에 연달아 두면 뭐가 뭔지 구분이 안 돼서, storybook처럼
 * 이름/설명/사용법 코드를 컴포넌트 하나당 섹션으로 분리했다 — 다른 개발자가 훑어보고
 * 바로 가져다 쓸 수 있게.
 */
const SelectDocSection = ({ name, description, usage, children }: SelectDocSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{`<${name} />`}</h2>
      <p className={styles.sectionDescription}>{description}</p>
    </div>
    <div className={styles.example}>{children}</div>
    <pre className={styles.usage}>
      <code>{usage}</code>
    </pre>
  </section>
)

const SelectDemoPage = async () => {
  const [products, sizeOptions, textOptions] = await Promise.all([
    getProducts(),
    getSizes(),
    getPurchaseOptions(),
  ])
  const thumbnailOptions: ThumbnailSelectOption[] = products.map((product) => ({
    id: product.id,
    image: product.image,
    label: product.name,
    price: product.price,
    discountRate: product.discountRate,
    badge: product.badge,
    bundleBadge: product.bundleBadge,
    stock: product.stock,
  }))

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Select</h1>
        <p className={styles.lead}>
          열림/닫힘·키보드 이동·품절 스킵 같은 동작 로직은 <code>src/hooks/useSelect.ts</code> 훅
          하나가 전담합니다. 아래 3개 컴포넌트는 이 훅만 공유할 뿐, 마크업과 스타일은 서로 완전히
          독립적입니다 — 새 생김새가 필요하면 기존 컴포넌트를 고치지 않고 훅 위에 새로 하나 만들면
          됩니다.
        </p>
        <p className={styles.keyboardLegend}>
          공통 키보드 동작 — 클릭 또는 <kbd>Tab</kbd> 이동 후 <kbd>Enter</kbd>/<kbd>Space</kbd>로
          열기 · <kbd>↑</kbd>/<kbd>↓</kbd>로 이동(품절 옵션은 건너뜀) · <kbd>Enter</kbd>로 선택 ·{' '}
          <kbd>Esc</kbd>로 닫기
        </p>
      </div>

      <SelectDocSection
        name="TextOptionSelect"
        description="텍스트 위주 옵션 컴포넌트. 구매 수량/번들처럼 이름·총액·1개당 단가·최대할인 표기·무료배송 배지가 필요한 옵션에 사용합니다."
        usage={`<TextOptionSelect
  title="옵션 선택"
  options={textOptions} // TextSelectOption[]
  onChange={(option) => {
    // option: { id, label, isMaxDiscount, price, unitPrice, isFreeShipping, stock }
  }}
/>`}
      >
        <TextOptionSelect title="옵션 선택" options={textOptions} />
      </SelectDocSection>

      <SelectDocSection
        name="SizeOptionSelect"
        description="숫자 값 옵션 컴포넌트. 사이즈처럼 재고(stock) 기반으로 품절을 판정해야 하는 옵션에 사용합니다 — stock이 0인 옵션은 키보드 이동에서 자동으로 건너뜁니다."
        usage={`<SizeOptionSelect
  title="사이즈"
  options={sizeOptions} // SizeSelectOption[] = { value, stock, deliveryText? }
/>`}
      >
        <SizeOptionSelect title="사이즈" options={sizeOptions} />
      </SelectDocSection>

      <SelectDocSection
        name="ThumbnailOptionSelect"
        description="이미지가 필요한 옵션 컴포넌트. next/image로 썸네일을 렌더합니다 — 할인율/배지/묶음배지 조합과 일시품절 상태를 함께 지원합니다. 로컬 SVG 플레이스홀더를 쓸 경우 next/image 최적화가 기본 차단되므로 unoptimized가 필요합니다."
        usage={`<ThumbnailOptionSelect
  title="옵션을 선택해 주세요"
  options={thumbnailOptions}
  // ThumbnailSelectOption[] = { id, image, label, price, discountRate?, badge?, bundleBadge?, stock }
/>`}
      >
        <ThumbnailOptionSelect title="옵션을 선택해 주세요" options={thumbnailOptions} />
      </SelectDocSection>
    </main>
  )
}

export default SelectDemoPage
