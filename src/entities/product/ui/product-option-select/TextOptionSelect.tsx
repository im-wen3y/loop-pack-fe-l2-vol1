'use client'

import { formatPrice } from '@/shared/lib/format-price'
import {
  isProductOptionSoldOut,
  type TextSelectOption,
} from '@/entities/product/model/product-option'
import { SelectToggleIcon } from '@/shared/ui/select/SelectToggleIcon'
import { useControlledSelect } from '@/shared/ui/select/useControlledSelect'
import styles from './TextOptionSelect.module.css'

type TextOptionSelectProps = {
  title: string
  options: TextSelectOption[]
  value?: TextSelectOption
  onValueChange: (option: TextSelectOption | undefined) => void
}

export const TextOptionSelect = ({
  title,
  options,
  value,
  onValueChange,
}: TextOptionSelectProps) => {
  const { containerRef, isOpen, selected, items, onTriggerClick, selectIndex, onClear, onKeyDown } =
    useControlledSelect({
      options,
      value,
      getOptionKey: (option) => option.id,
      isOptionDisabled: (option) => isProductOptionSoldOut(option.stock),
      onValueChange,
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
            {items.map(({ option, selected: isSelected, highlighted, disabled }, index) => {
              return (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={disabled}
                  className={[
                    styles.option,
                    highlighted && styles.highlighted,
                    disabled && styles.disabled,
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
