import { NextResponse } from 'next/server'
import { getProducts } from '@/services/product-options'

export function GET() {
  return NextResponse.json({ products: getProducts() })
}
