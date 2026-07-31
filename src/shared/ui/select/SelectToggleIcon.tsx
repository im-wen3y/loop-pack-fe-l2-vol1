import Image from 'next/image'
import styles from './SelectToggleIcon.module.css'

type SelectToggleIconProps = {
  isOpen: boolean
}

/*
 * Select 표현이 달라도 공통으로 사용하는 열림 상태 아이콘이다.
 * next/image's optimizer rejects local SVGs by default; unoptimized serves it as-is.
 */
export const SelectToggleIcon = ({ isOpen }: SelectToggleIconProps) => (
  <Image
    src="/toggle.svg"
    alt=""
    aria-hidden
    width={20}
    height={20}
    unoptimized
    className={[styles.toggleIcon, isOpen && styles.toggleIconOpen].filter(Boolean).join(' ')}
  />
)
