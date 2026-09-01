'use client'

import { useOrderListQuery } from '@/entities/order'
import styles from './orders.module.css'

// 상품명·이미지·금액은 그리지 않는다. GET /api/orders의 items가 { productId, quantity }뿐이라
// (app/api/_data/auth.ts) 상품을 id로 조회하지 않는 한 붙일 정보가 없다.
export const OrderList = () => {
  const { data, isPending, error } = useOrderListQuery()

  if (isPending) {
    return <p>주문 내역을 불러오는 중입니다.</p>
  }

  if (error !== null) {
    return <p role="alert">{error.message}</p>
  }

  // 새 계정으로 처음 들어오면 이 화면을 먼저 본다.
  if (data.orders.length === 0) {
    return <p>주문 내역이 없습니다.</p>
  }

  return (
    <ul className={styles.list}>
      {data.orders.map((order) => (
        <li key={order.id} className={styles.order}>
          <p className={styles.meta}>
            <span>주문번호 {order.id}</span>
            <time dateTime={order.createdAt}>
              {new Date(order.createdAt).toLocaleString('ko-KR')}
            </time>
          </p>
          <ul className={styles.items}>
            {order.items.map((item) => (
              <li key={item.productId}>
                {item.productId} × {item.quantity}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
