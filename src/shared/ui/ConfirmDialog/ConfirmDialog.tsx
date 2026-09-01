'use client'

import { useEffect, useRef } from 'react'
import styles from './ConfirmDialog.module.css'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

// <dialog>의 showModal()을 쓴다. 포커스 트랩·Esc 닫기·백드롭·inert 처리가 브라우저 기본이라
// 라이브러리가 필요 없다. window.confirm()은 스타일을 줄 수 없고 렌더링을 막으며,
// E2E에서도 별도 dialog 핸들러를 요구한다.
//
// 문구와 버튼 라벨만 받는다. 도메인 지식이 없어야 shared에 맞다.
export const ConfirmDialog = ({
  isOpen,
  title,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // 열림 상태는 React가 들고, 실제 표시는 명령형 DOM API로만 가능하다.
  // open 속성을 직접 주면 모달이 아니라 포커스 트랩과 백드롭이 없다.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) {
      return
    }

    if (isOpen) {
      dialog.showModal()
      return () => dialog.close()
    }
  }, [isOpen])

  return (
    <dialog
      className={styles.dialog}
      ref={dialogRef}
      // Esc와 백드롭 닫기는 브라우저가 처리하고, 우리는 그 사실만 전달받는다.
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <p className={styles.title}>{title}</p>
      <div className={styles.actions}>
        {/* 기본 포커스는 취소에 둔다. Enter를 눌러 되돌릴 수 없는 동작이 실행되지 않게 한다. */}
        <button type="button" autoFocus onClick={onCancel}>
          {cancelLabel}
        </button>
        {/* 오른쪽이 확인. 기본은 "확인"이지만 되돌릴 수 없는 동작에서는 일어날 일을 그대로 쓴다
            (예: "전체 삭제"). 창을 안 읽고 누르는 사람에게 버튼 글자가 마지막 안내다. */}
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
