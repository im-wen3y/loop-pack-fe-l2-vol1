import Link from 'next/link'
import styles from './Header.module.css'

export const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/">Commerce</Link>
      <nav className={styles.navigation} aria-label="주요 메뉴">
        <Link href="/products">상품</Link>
        <span>위시리스트 0</span>
        <span>장바구니 0</span>
      </nav>
    </header>
  )
}
