import Image from 'next/image'
import { ProductCardActions } from '@/components/ui/productCard/ProductCardActions'
import { formatPrice } from '@/shared/lib/format-price'
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
      <strong>{formatPrice(product.price)}</strong>
      <ProductCardActions productId={product.id} productName={product.name} />
    </article>
  )
}
