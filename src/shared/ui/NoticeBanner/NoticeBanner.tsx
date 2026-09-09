import type { ReactNode } from 'react'
import styles from './NoticeBanner.module.css'

type NoticeBannerProps = {
  children: ReactNode
  role?: 'alert' | 'status'
  action?: ReactNode
}

export const NoticeBanner = ({ children, role = 'alert', action }: NoticeBannerProps) => (
  <div className={styles.banner} role={role}>
    <p className={styles.message}>{children}</p>
    {action !== undefined && <div className={styles.action}>{action}</div>}
  </div>
)
