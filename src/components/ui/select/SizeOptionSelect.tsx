'use client'

import Image from 'next/image'
import { useSelect } from '@/hooks/useSelect'
import styles from './SizeOptionSelect.module.css'

export type SizeSelectOption = {
  value: number
  stock: number
  deliveryText?: string
}

const DeliveryTruckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 16"
    fill="none"
    aria-hidden
    className={styles.deliveryIcon}
  >
    <rect x="1" y="3" width="13" height="8" rx="1" fill="currentColor" />
    <path d="M14 6H18L21 9V11H14V6Z" fill="currentColor" />
    <circle cx="5" cy="12.5" r="1.5" fill="currentColor" />
    <circle cx="17" cy="12.5" r="1.5" fill="currentColor" />
  </svg>
)

type SizeOptionSelectProps = {
  title: string
  options: SizeSelectOption[]
  defaultValue?: SizeSelectOption
  onChange?: (option: SizeSelectOption | undefined) => void
}

export const SizeOptionSelect = ({
  title,
  options,
  defaultValue,
  onChange,
}: SizeOptionSelectProps) => {
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
                  key={option.value}
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
                  <span className={styles.value}>{option.value}</span>
                  {isSoldOut ? (
                    <span className={styles.soldOut}>품절</span>
                  ) : (
                    option.deliveryText && (
                      <span className={styles.delivery}>
                        <DeliveryTruckIcon />
                        {option.deliveryText}
                      </span>
                    )
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {selected && (
        <div className={styles.selected} data-testid="selected">
          <div className={styles.selectedInfo}>
            <span className={styles.value}>{selected.value}</span>
            {selected.stock === 0 ? (
              <span className={styles.soldOut}>품절</span>
            ) : (
              selected.deliveryText && (
                <span className={styles.delivery}>
                  <DeliveryTruckIcon />
                  {selected.deliveryText}
                </span>
              )
            )}
          </div>
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClear}
            aria-label="선택 해제"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
