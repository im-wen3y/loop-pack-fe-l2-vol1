import { HttpResponse, http } from 'msw'
import {
  productListCategories,
  productListProducts,
} from '@/_pages/product-list/testing/product-list-fixtures'
import { PRODUCT_SORT_VALUES, type Product, type ProductSort } from '@/entities/product'

const sortProducts = (products: Product[], sort: ProductSort) =>
  products.sort((first, second) => {
    switch (sort) {
      case 'popular':
        return second.reviewCount - first.reviewCount || second.rating - first.rating
      case 'price-asc':
        return first.price - second.price
      case 'price-desc':
        return second.price - first.price
      case 'latest':
        return Date.parse(second.createdAt) - Date.parse(first.createdAt)
    }
  })

export const getProductListFixtureResponse = (request: Request) => {
  const params = new URL(request.url).searchParams
  const query = params.get('q')?.trim().toLocaleLowerCase('ko') ?? ''
  const category = params.get('category') ?? 'all'
  const sortParam = params.get('sort')
  const sort = PRODUCT_SORT_VALUES.find((value) => value === sortParam) ?? 'latest'
  const page = Number(params.get('page') ?? '1')
  const pageSize = Number(params.get('pageSize') ?? '12')

  const filteredProducts = productListProducts.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category
    const searchable = `${product.brand} ${product.name}`.toLocaleLowerCase('ko')

    return matchesCategory && searchable.includes(query)
  })
  const sortedProducts = sortProducts([...filteredProducts], sort)
  const start = (page - 1) * pageSize

  return {
    products: sortedProducts.slice(start, start + pageSize),
    categories: productListCategories,
    totalCount: filteredProducts.length,
    page,
    pageSize,
  }
}

export const productListSuccessHandler = http.get('/api/products', ({ request }) => {
  return HttpResponse.json(getProductListFixtureResponse(request))
})
