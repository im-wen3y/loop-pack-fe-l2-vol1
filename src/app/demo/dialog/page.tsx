'use client'

import { useState, type ReactNode } from 'react'
import { Dialog } from '@/components/ui/dialog'
import styles from './page.module.css'

type DialogDocSectionProps = {
  name: string
  description: string
  usage: string
  children: ReactNode
}

const DialogDocSection = ({ name, description, usage, children }: DialogDocSectionProps) => (
  <section className={styles.section}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{`<${name} />`}</h2>
      <p className={styles.sectionDescription}>{description}</p>
    </div>
    <div className={styles.example}>{children}</div>
    <pre className={styles.usage}>
      <code>{usage}</code>
    </pre>
  </section>
)

const DialogDemoPage = () => {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false)
  const [eventLog, setEventLog] = useState<string[]>([])

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Dialog</h1>
        <p className={styles.lead}>
          Context로 조립하는 compound 컴포넌트입니다. <code>open</code> prop을 넘기지 않으면 내부
          state로 동작하는 uncontrolled, <code>open</code>·<code>onOpenChange</code>를 넘기면 부모가
          열림 상태를 직접 소유하는 controlled — 두 API를 하나의 컴포넌트가 모두 지원합니다.
        </p>
      </div>

      <DialogDocSection
        name="Dialog"
        description="Trigger 없이 내부 state만으로 열고 닫는 uncontrolled 사용 예시입니다. Esc, 오버레이 클릭, Close 버튼 모두 닫힙니다."
        usage={`<Dialog>
  <Dialog.Trigger>이용 안내 보기</Dialog.Trigger>
  <Dialog.Overlay />
  <Dialog.Content>
    <Dialog.Title>이용 안내</Dialog.Title>
    <Dialog.Description>
      체크아웃 전에 배송/교환 정책을 확인해 주세요.
    </Dialog.Description>
    <Dialog.Close>닫기</Dialog.Close>
  </Dialog.Content>
</Dialog>`}
      >
        <Dialog>
          <Dialog.Trigger className={styles.trigger}>이용 안내 보기</Dialog.Trigger>
          <Dialog.Overlay data-testid="uncontrolled-overlay" />
          <Dialog.Content data-testid="uncontrolled-content">
            <Dialog.Title>이용 안내</Dialog.Title>
            <Dialog.Description>체크아웃 전에 배송/교환 정책을 확인해 주세요.</Dialog.Description>
            <Dialog.Close aria-label="이용 안내 닫기" />
          </Dialog.Content>
        </Dialog>
      </DialogDocSection>

      <DialogDocSection
        name="Dialog"
        description="open·onOpenChange를 부모가 들고 있는 controlled 사용 예시입니다. Dialog 트리 밖의 버튼이 Trigger를 거치지 않고 직접 열고, 어떤 경로로 닫히든 onOpenChange 로그가 남습니다."
        usage={`const [isOpen, setIsOpen] = useState(false)

<button onClick={() => setIsOpen(true)}>외부에서 열기</button>

<Dialog
  open={isOpen}
  onOpenChange={(next) => setIsOpen(next)}
>
  <Dialog.Overlay />
  <Dialog.Content>
    <Dialog.Title>첫 구매 10% 할인</Dialog.Title>
    <Dialog.Close />
  </Dialog.Content>
</Dialog>`}
      >
        <button
          type="button"
          className={styles.trigger}
          onClick={() => {
            setIsNoticeOpen(true)
            setEventLog((log) => [...log, '외부 버튼으로 열림 (Trigger 없이 open을 직접 true로)'])
          }}
        >
          외부에서 이벤트 팝업 열기
        </button>
        <Dialog
          open={isNoticeOpen}
          onOpenChange={(next) => {
            setIsNoticeOpen(next)
            setEventLog((log) => [...log, next ? 'onOpenChange(true)' : 'onOpenChange(false)'])
          }}
        >
          <Dialog.Overlay data-testid="controlled-overlay" />
          <Dialog.Content data-testid="controlled-content">
            <Dialog.Title>첫 구매 10% 할인</Dialog.Title>
            <Dialog.Description>
              지금 가입하면 첫 구매 10% 할인 쿠폰이 즉시 지급됩니다.
            </Dialog.Description>
            <Dialog.Close aria-label="이벤트 팝업 닫기" />
          </Dialog.Content>
        </Dialog>
        {eventLog.length > 0 && (
          <ul className={styles.eventLog} data-testid="event-log">
            {eventLog.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        )}
      </DialogDocSection>
    </main>
  )
}

export default DialogDemoPage
