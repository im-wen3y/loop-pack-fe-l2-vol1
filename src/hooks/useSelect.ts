import type { KeyboardEvent, MouseEvent } from 'react'
import { useState } from 'react'

type UseSelectParams<T> = {
  options: T[]
  defaultValue?: T
  isOptionDisabled?: (option: T) => boolean
  onChange?: (value: T | undefined) => void
}

export const useSelect = <T>({
  options,
  defaultValue,
  isOptionDisabled = () => false,
  onChange,
}: UseSelectParams<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<T | undefined>(defaultValue)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // selected는 옵션 객체 자체라 selectedIndex는 매번 계산 가능한 파생값이다.
  // 별도 state로 두면 옵션이 바뀔 때 두 값이 어긋나는 동기화 버그가 생길 수 있어 그냥 계산한다.
  const selectedIndex = options.findIndex((option) => option === selected)

  // 전부 품절이어도 options.length번을 넘겨 순회하지 않으므로 무한루프 없이 -1로 끝난다.
  const stepToEnabled = (from: number, direction: 1 | -1): number => {
    if (options.length === 0) return -1
    let index = from
    for (let i = 0; i < options.length; i++) {
      index = (index + direction + options.length) % options.length
      if (!isOptionDisabled(options[index])) return index
    }
    return -1
  }

  const open = () => {
    setIsOpen(true)
    setHighlightedIndex(
      selectedIndex !== -1 && !isOptionDisabled(options[selectedIndex])
        ? selectedIndex
        : stepToEnabled(-1, 1),
    )
  }

  const close = () => setIsOpen(false)

  const toggle = () => (isOpen ? close() : open())

  // Safari/WebKit don't focus a <button> on click by default, so a mouse click that opens
  // the list would leave ArrowDown/Enter/Esc with nothing focused to fire on. Force it.
  const onTriggerClick = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.focus()
    toggle()
  }

  const selectIndex = (index: number) => {
    const option = options[index]
    if (!option || isOptionDisabled(option)) return
    if (option !== selected) {
      setSelected(option)
      onChange?.(option)
    }
    setHighlightedIndex(index)
    close()
  }

  const onClear = () => {
    setSelected(undefined)
    setHighlightedIndex(-1)
    onChange?.(undefined)
  }

  // 트리거는 실제 <button>이라 Enter/Space로 열리는 건 네이티브 클릭이 처리하므로
  // 메뉴가 열려 있을 때의 이동/선택/닫기만 여기서 다룬다.
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isOpen) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex(stepToEnabled(highlightedIndex, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex(stepToEnabled(highlightedIndex, -1))
        break
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex !== -1) selectIndex(highlightedIndex)
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
    }
  }

  return {
    isOpen,
    selected,
    selectedIndex,
    highlightedIndex,
    open,
    close,
    toggle,
    onTriggerClick,
    selectIndex,
    onClear,
    onKeyDown,
  }
}
