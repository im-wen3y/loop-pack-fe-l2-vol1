export type SizeSelectOption = {
  value: number
  stock: number
  deliveryText?: string
}

export const isProductOptionSoldOut = (stock: number) => stock === 0

export type TextSelectOption = {
  id: string
  label: string
  isMaxDiscount: boolean
  price: number
  unitPrice: number
  isFreeShipping: boolean
  stock: number
}

export type ThumbnailSelectOption = {
  id: string
  image: string
  label: string
  price: number
  discountRate?: number
  badge?: string
  bundleBadge?: string
  stock: number
}
