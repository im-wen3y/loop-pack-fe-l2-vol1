import { ProductCard, type ProductCardItem } from '@/features/product-card'
import styles from './ProductGrid.module.css'

type ProductGridProps = {
  products: readonly ProductCardItem[]
  titleLevel: 2 | 3
}

export const ProductGrid = ({ products, titleLevel }: ProductGridProps) => {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} titleLevel={titleLevel} />
      ))}
    </div>
  )
}
