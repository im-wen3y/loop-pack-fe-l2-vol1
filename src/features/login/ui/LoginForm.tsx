'use client'

import { useLogin } from '@/features/login/model/useLogin'
import styles from './LoginForm.module.css'

type LoginFormProps = {
  returnPath: string
}

export const LoginForm = ({ returnPath }: LoginFormProps) => {
  const { login, isPending, error } = useLogin(returnPath)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // 폼 요소에서 직접 읽는다. 입력값을 state로 들어 렌더마다 동기화할 이유가 없다.
    const formData = new FormData(event.currentTarget)
    login({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        이메일
        <input type="email" name="email" autoComplete="username" required />
      </label>
      <label className={styles.field}>
        비밀번호
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button type="submit" disabled={isPending}>
        {isPending ? '로그인 중…' : '로그인'}
      </button>
      {/*
        오류 영역은 한 자리에 고정한다. 자격 증명 불일치(401)와 본문 형식 오류(400)가
        같은 자리에 뜨고, role="alert"라 스크린리더와 E2E가 같은 것을 본다.
      */}
      <p className={styles.error} role="alert">
        {error === null ? '' : error.message}
      </p>
    </form>
  )
}
