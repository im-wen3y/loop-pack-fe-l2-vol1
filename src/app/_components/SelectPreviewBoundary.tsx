'use client'

import { Component, type ReactNode } from 'react'

type SelectPreviewBoundaryProps = {
  children: ReactNode
}

type SelectPreviewBoundaryState = {
  hasError: boolean
}

/*
 * SelectPreview(catalog.ts의 fetch)가 실패해도 같은 페이지의 Dialog 탭까지 함께 무너지면
 * 안 되니, 컴포넌트 단위로 에러 범위를 좁힌다. React는 함수형 에러 바운더리를 지원하지
 * 않아 이 파일만 code-style.md의 "const 화살표 함수" 컨벤션의 예외다 — class 없이는
 * getDerivedStateFromError를 쓸 방법이 없다.
 */
export class SelectPreviewBoundary extends Component<
  SelectPreviewBoundaryProps,
  SelectPreviewBoundaryState
> {
  state: SelectPreviewBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>옵션 데이터를 불러오지 못했습니다.</p>
          <button type="button" onClick={() => this.setState({ hasError: false })}>
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
