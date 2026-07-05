import { useEffect, useState } from 'react'
import { Header } from '../_components/productList/Header'
import { SearchFilter } from '../_components/productList/SearchFilter'
import { SearchSort } from '../_components/productList/SearchSort'
import { ProductGrid } from '../_components/productList/ProductGrid'
import { Pagination } from '../_components/productList/Pagination'
import { ErrorState } from '../_components/productList/ErrorState'
import { usePagination } from '../_hooks/productList/usePagination'
import { useProductFilters } from '../_hooks/productList/useProductFilters'
import { useProductListQuery } from '../_hooks/productList/useProductListQuery'
import { useSyncFiltersToUrl } from '../_hooks/productList/useSyncFiltersToUrl'
import { useWishlist } from '../_hooks/productList/useWishlist'
import { useRecentlyViewed } from '../_hooks/productList/useRecentlyViewed'
import { useScrollToTop } from '../_hooks/useScrollToTop'
import type { ViewMode } from '../_types/product'
import './ProductListPage.css'

export function ProductListPage() {
  const pagination = usePagination()
  useScrollToTop(pagination.page)

  const {
    filters,
    handleCategoryChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    handleSortChange,
    handleSearchChange,
    handleInStockToggle,
    handleResetFilters,
    replaceFilters,
  } = useProductFilters({ onFilterChange: pagination.resetPage })

  const { page, goToPage } = pagination

  const { products, totalCount, totalPages, isLoading, isFetching, error, refetch } =
    useProductListQuery({
      filters,
      page,
    })

  useSyncFiltersToUrl(filters, page, replaceFilters, goToPage)

  // ?page=99처럼 totalPages를 넘는 값으로 진입하면 응답을 받은 뒤 마지막 페이지로 재보정한다.
  // totalPages는 서버 응답 이후에만 알 수 있어 usePagination 초기화 시점엔 클램프할 수 없다.
  useEffect(() => {
    if (isLoading || page <= totalPages) return
    goToPage(totalPages)
  }, [isLoading, page, totalPages, goToPage])

  const { wishlist, toggleWishlist } = useWishlist()
  const { addRecentlyViewed } = useRecentlyViewed()

  // 보기 모드(그리드/리스트)는 부수효과 없는 순수 UI 상태라 페이지에 둔다.
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // ─── 로딩/에러는 early return ───────────────────────────
  if (isLoading) {
    return <div className="loading">로딩 중...</div>
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />
  }

  return (
    <div className="product-list-page">
      <Header totalCount={totalCount} wishlistCount={wishlist.length} />

      <SearchFilter
        filters={{
          category: filters.category,
          maxPrice: filters.maxPrice,
          minPrice: filters.minPrice,
          inStockOnly: filters.inStockOnly,
        }}
        onFilterChange={{
          onCategoryChange: handleCategoryChange,
          onMinPriceChange: handleMinPriceChange,
          onMaxPriceChange: handleMaxPriceChange,
          onInStockOnlyChange: handleInStockToggle,
        }}
        onResetFilters={handleResetFilters}
      />

      <SearchSort
        searchQuery={filters.searchQuery}
        sortBy={filters.sortBy}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
      />

      <ProductGrid
        products={products}
        searchQuery={filters.searchQuery}
        viewMode={viewMode}
        wishlist={wishlist}
        onProductClick={addRecentlyViewed}
        onWishlistToggle={toggleWishlist}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      {/* ─── 백그라운드 로딩 인디케이터 ─────────────────── */}
      {isFetching && <div className="background-loading">데이터 갱신 중...</div>}
    </div>
  )
}
