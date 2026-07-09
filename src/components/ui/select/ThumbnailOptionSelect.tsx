'use client'

import Image from 'next/image'
import { useSelect } from '@/hooks/useSelect'
import { formatPrice } from '@/utils/formatPrice'
import styles from './ThumbnailOptionSelect.module.css'

export type ThumbnailSelectOption = {
  id: string
  image: string
  label: string
  price: number
  discountRate?: number
  badge?: string
  bundleBadge?: string
  stock: number
}

type ThumbnailOptionSelectProps = {
  title: string
  options: ThumbnailSelectOption[]
  defaultValue?: ThumbnailSelectOption
  onChange?: (option: ThumbnailSelectOption | undefined) => void
}

export const ThumbnailOptionSelect = ({
  title,
  options,
  defaultValue,
  onChange,
}: ThumbnailOptionSelectProps) => {
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
          className={[styles.trigger, isOpen && styles.triggerActive].filter(Boolean).join(' ')}
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
                  {/* mock 데이터가 로컬 SVG라 최적화 파이프라인이 거부한다; 실제 사진(JPG/PNG)이면 불필요. */}
                  <Image
                    src={option.image}
                    alt={option.label}
                    width={56}
                    height={56}
                    unoptimized
                    className={[styles.thumbnail, isSoldOut && styles.thumbnailSoldOut]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  <div className={styles.info}>
                    <span
                      className={[styles.label, isSoldOut && styles.textSoldOut]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {option.label}
                    </span>
                    <div className={styles.priceRow}>
                      {option.discountRate !== undefined && !isSoldOut && (
                        <span className={styles.discountRate}>{option.discountRate}%</span>
                      )}
                      <span
                        className={[styles.price, isSoldOut && styles.textSoldOut]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {formatPrice(option.price)}
                      </span>
                      {isSoldOut ? (
                        <span className={styles.soldOutBadge}>일시품절</span>
                      ) : (
                        option.badge && <span className={styles.badge}>{option.badge}</span>
                      )}
                      {option.bundleBadge && (
                        <span className={styles.bundleBadge}>{option.bundleBadge}</span>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {selected && (
        <div className={styles.selected} data-testid="selected">
          <Image
            src={selected.image}
            alt={selected.label}
            width={40}
            height={40}
            unoptimized
            className={styles.thumbnail}
          />
          <div className={styles.info}>
            <span className={styles.label}>{selected.label}</span>
            <div className={styles.priceRow}>
              {selected.discountRate !== undefined && (
                <span className={styles.discountRate}>{selected.discountRate}%</span>
              )}
              <span className={styles.price}>{formatPrice(selected.price)}</span>
              {selected.badge && <span className={styles.badge}>{selected.badge}</span>}
              {selected.bundleBadge && (
                <span className={styles.bundleBadge}>{selected.bundleBadge}</span>
              )}
            </div>
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
