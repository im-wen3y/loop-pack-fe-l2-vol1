'use client'

import Image from 'next/image'
import { useSelect } from '@/hooks/useSelect'
import { formatPrice } from '@/utils/formatPrice'
import styles from './TextOptionSelect.module.css'

export type TextSelectOption = {
  id: string
  label: string
  isMaxDiscount: boolean
  price: number
  unitPrice: number
  freeShipping: boolean
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
    isOptionDisabled: (option) => option.stock === 0,
    onChange,
  })

  return (
    <div>
      <div className={styles.container}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={isOpen}
          onClick={onTriggerClick}
          onKeyDown={onKeyDown}
        >
          <span>{title}</span>
          {/* next/image's optimizer rejects local SVGs by default; unoptimized serves it as-is. */}
          <Image
            src="/toggle.svg"
            alt=""
            aria-hidden
            width={20}
            height={20}
            unoptimized
            className={[styles.toggleIcon, isOpen && styles.toggleIconOpen]
              .filter(Boolean)
              .join(' ')}
          />
        </button>
        {isOpen && (
          <ul className={styles.list} role="listbox">
            {options.map((option, index) => {
              const isSoldOut = option.stock === 0
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
                    {option.freeShipping && <span className={styles.badge}>무료배송</span>}
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
              {selected.freeShipping && <span className={styles.badge}>무료배송</span>}
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
