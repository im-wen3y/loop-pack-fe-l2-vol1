import type { KeyboardEvent, MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

/*
 * TextOptionSelect/SizeOptionSelect/ThumbnailOptionSelect는 마크업·스타일이 전부 다르지만
 * 열림/닫힘, 키보드 이동, 품절 옵션 스킵, 선택/해제라는 '동작'은 동일하다. 이 동작만 이 훅이
 * 전담하는 Headless UI로 분리해, 각 컴포넌트는 훅이 준 상태/핸들러를 자기 마크업에 꽂기만 한다.
 *
 * 훅 이름은 useSelect지만 실제로는 열림/닫힘 · 키보드 탐색(품절 스킵) · 바깥 클릭 감지 · 선택까지
 * 담당한다. 더 잘게 쪼개지 않은 이유는 이 전부가 "헤드리스 select 위젯 하나"의 상호작용 상태
 * 머신이라는 단일 책임에 속하기 때문이다 — 네이티브 <select> 하나가 내부적으로 처리하는 범위와
 * 동일하다. Dialog가 custom hook 대신 Context를 쓰는 이유, 바깥 클릭 감지를 별도 훅으로 안 뽑은
 * 이유는 `src/hooks/README.md` 참고.
 */
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
  const containerRef = useRef<HTMLDivElement>(null)

  /*
   * selected는 옵션 객체 자체라 selectedIndex는 매번 계산 가능한 파생값이다.
   * 별도 state로 두면 옵션이 바뀔 때 두 값이 어긋나는 동기화 버그가 생길 수 있어 그냥 계산한다.
   */
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

  /*
   * 열려 있을 때 컨테이너(트리거+리스트) 밖을 클릭하면 닫는다. click이 아니라 mousedown을 쓰는
   * 이유는 — mousedown이 click보다 먼저 발생해서, 다른 셀렉트의 트리거를 클릭했을 때 "이 리스트를
   * 닫고" → "그 트리거의 자체 onClick(toggle)이 그 리스트를 여는" 순서가 항상 보장된다.
   * containerRef가 트리거와 리스트를 모두 감싸므로, 자기 트리거를 눌러 닫는 클릭은 `.contains()`가
   * true를 반환해 그냥 지나간다 — onTriggerClick의 toggle()과 이중으로 충돌하지 않는다.
   * close() 대신 setIsOpen(false)를 직접 부르는 이유는, close는 렌더마다 새로 만들어지는
   * 함수라 deps에 넣으면 리스너가 매 렌더 재등록되기 때문이다 — setIsOpen은 항상 안정된 참조라
   * deps에 넣을 필요가 없다.
   *
   * blur(포커스 아웃)로도 닫는 방안을 검토했지만 뺐다 — 옵션 <li>는 포커스 불가능한 엘리먼트라
   * 옵션을 클릭하면 relatedTarget이 null이 되어 "포커스가 밖으로 나갔다"고 오판, selectIndex가
   * 실행되기 전에 리스트를 닫아버려 클릭 선택 자체가 깨진다(Playwright로 실제로 재현·확인).
   * mousedown 기반 바깥 클릭 감지만으로 충분하다고 판단해 blur 핸들러는 두지 않는다.
   */
  useEffect(() => {
    if (!isOpen) return
    const onOutsideMouseDown = (event: globalThis.MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setIsOpen(false)
    }
    document.addEventListener('mousedown', onOutsideMouseDown)
    return () => document.removeEventListener('mousedown', onOutsideMouseDown)
  }, [isOpen])

  /*
   * Safari/WebKit don't focus a <button> on click by default, so a mouse click that opens
   * the list would leave ArrowDown/Enter/Esc with nothing focused to fire on. Force it.
   */
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

  /*
   * onTriggerClick처럼 DOM 이벤트 prop에 그대로 꽂는 핸들러라 onX 네이밍으로 통일했다
   * (clearSelection 대신 onClear). selectIndex와 마찬가지로 실질 변화가 없으면 아무것도
   * 안 한다 — 이미 선택 해제된 상태에서 또 onClear가 불려도 onChange(undefined)가 중복
   * 호출되지 않는다.
   */
  const onClear = () => {
    if (selected === undefined) return
    setSelected(undefined)
    setHighlightedIndex(-1)
    onChange?.(undefined)
  }

  /*
   * 트리거는 실제 <button>이라 Enter/Space로 열리는 건 네이티브 클릭이 처리하므로
   * 메뉴가 열려 있을 때의 이동/선택/닫기만 여기서 다룬다.
   */
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
    containerRef,
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
