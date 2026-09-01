'use client'

import { useState } from 'react'
import { useCartStore } from '@/entities/cart'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'

// 되돌릴 수 없는 동작이라 한 번 묻는다.
export const ClearCartButton = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const clearAll = useCartStore((state) => state.clearAll)

  return (
    <>
      <button type="button" onClick={() => setIsConfirmOpen(true)}>
        전체 비우기
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="장바구니에 담긴 상품을 전체 삭제하시겠습니까?"
        confirmLabel="전체 삭제"
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          clearAll()
          setIsConfirmOpen(false)
        }}
      />
    </>
  )
}
