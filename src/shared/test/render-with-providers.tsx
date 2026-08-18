import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import type { ReactNode } from 'react'

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  searchParams?: string | Record<string, string> | URLSearchParams
  onUrlUpdate?: (event: UrlUpdateEvent) => void
}

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  })

export const renderWithProviders = (
  ui: ReactNode,
  { searchParams, onUrlUpdate, ...renderOptions }: RenderWithProvidersOptions = {},
) => {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
        {children}
      </NuqsTestingAdapter>
    </QueryClientProvider>
  )

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient }
}
