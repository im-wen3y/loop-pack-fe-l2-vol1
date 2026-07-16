import Image from 'next/image'
import styles from './ProductCard.module.css'

export type ProductCardItem = {
  id: string
  image: string
  name: string
  brand: string
  price: number
}

type ProductCardProps = {
  product: ProductCardItem
  titleLevel: 2 | 3
}

export const ProductCard = ({ product, titleLevel }: ProductCardProps) => {
  const ProductTitle = titleLevel === 2 ? 'h2' : 'h3'

  return (
    <article className={styles.card}>
      <Image
        className={styles.image}
        src={product.image}
        alt={product.name}
        width={400}
        height={400}
      />
      <p>{product.brand}</p>
      <ProductTitle>{product.name}</ProductTitle>
      <strong>{product.price.toLocaleString('ko-KR')}원</strong>
      <div className={styles.actions}>
        <button type="button" aria-label={`${product.name} 위시리스트`} aria-pressed={false}>
          찜
        </button>
        <button type="button" aria-label={`${product.name} 장바구니`} aria-pressed={false}>
          담기
        </button>
      </div>
    </article>
  )
}
