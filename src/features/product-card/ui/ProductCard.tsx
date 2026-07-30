import Image from 'next/image'
import type { ProductCardItem } from '@/features/product-card/model/types'
import { ProductCardActions } from '@/features/product-card/ui/ProductCardActions'
import { formatPrice } from '@/shared/lib/format-price'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  product: ProductCardItem
  titleLevel: 2 | 3
}

// 상품 정보 표시. Client 경계는 행위 버튼(ProductCardActions)까지만 내려가 있고
// 이 컴포넌트 자체는 Server Component로 남는다.
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
      <strong>{formatPrice(product.price)}</strong>
      <ProductCardActions productId={product.id} productName={product.name} />
    </article>
  )
}
