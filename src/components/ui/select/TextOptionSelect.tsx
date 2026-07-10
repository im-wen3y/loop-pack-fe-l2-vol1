'use client'

import { useSelect } from '@/hooks/useSelect'
import { formatPrice } from '@/utils/formatPrice'
import { isSoldOut as checkIsSoldOut } from '@/utils/isSoldOut'
import { SelectToggleIcon } from './SelectToggleIcon'
import styles from './TextOptionSelect.module.css'

export type TextSelectOption = {
  id: string
  label: string
  isMaxDiscount: boolean
  price: number
  unitPrice: number
  isFreeShipping: boolean
  /*
   * soldOut(boolean) 대신 stock 자체를 받는다 — SizeSelectOption과 동일한 방식으로,
   * 품절 여부(stock === 0)는 값을 따로 안 받고 아래에서 파생값으로 계산한다.
   */
  stock: number
}

type TextOptionSelectProps = {
  title: string
  options: TextSelectOption[]
  defaultValue?: TextSelectOption
  onChange?: (option: TextSelectOption | undefined) => void
}

export const TextOptionSelect = ({
  title,
  options,
  defaultValue,
  onChange,
}: TextOptionSelectProps) => {
  const {
    containerRef,
    isOpen,
    selected,
    selectedIndex,
    highlightedIndex,
    onTriggerClick,
    selectIndex,
    onClear,
    onKeyDown,
  } = useSelect({
    options,
    defaultValue,
    isOptionDisabled: (option) => checkIsSoldOut(option.stock),
    onChange,
  })

  return (
    <div>
      <div className={styles.container} ref={containerRef}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={isOpen}
          onClick={onTriggerClick}
          onKeyDown={onKeyDown}
        >
          <span>{title}</span>
          <SelectToggleIcon isOpen={isOpen} />
        </button>
        {isOpen && (
          <ul className={styles.list} role="listbox">
            {options.map((option, index) => {
              const isSoldOut = checkIsSoldOut(option.stock)
              return (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={index === selectedIndex}
                  aria-disabled={isSoldOut}
                  className={[
                    styles.option,
                    index === highlightedIndex && styles.highlighted,
                    isSoldOut && styles.disabled,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectIndex(index)}
                >
                  <div className={styles.optionTop}>
                    <span className={styles.label}>
                      {option.isMaxDiscount ? `[최대할인] ${option.label}` : option.label}
                    </span>
                    {option.isFreeShipping && <span className={styles.badge}>무료배송</span>}
                  </div>
                  <div className={styles.optionPrice}>
                    <span className={styles.price}>{formatPrice(option.price)}</span>
                    <span className={styles.unitPrice}>
                      (1개당 {formatPrice(option.unitPrice)})
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {selected && (
        <div className={styles.selected} data-testid="selected">
          <div className={styles.optionTop}>
            <span className={styles.selectedLabel}>
              {selected.isMaxDiscount ? `[최대할인] ${selected.label}` : selected.label}
            </span>
            <div className={styles.selectedTopRight}>
              {selected.isFreeShipping && <span className={styles.badge}>무료배송</span>}
              <button
                type="button"
                className={styles.clearButton}
                onClick={onClear}
                aria-label="선택 해제"
              >
                ×
              </button>
            </div>
          </div>
          <div className={styles.optionPrice}>
            <span className={styles.price}>{formatPrice(selected.price)}</span>
            <span className={styles.unitPrice}>(1개당 {formatPrice(selected.unitPrice)})</span>
          </div>
        </div>
      )}
    </div>
  )
}
