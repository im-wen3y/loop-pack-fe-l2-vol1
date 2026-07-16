# 5주차 상태 설계 표

> 기준: [`docs/assignments/week-05.md`](../assignments/week-05.md)

| 상태 | 소유자 | 수명 | 공유 범위 | 선택 이유 |
| ---- | ------ | ---- | --------- | --------- |
|      |        |      |           |           |

## 기록할 설계 근거

- TanStack Query·nuqs·Zustand의 책임을 나눈 기준
- staleTime과 gcTime 정책
- store 데이터 형태와 selector 경계
- 전역으로 올리지 않은 상태와 이유
- 로그인·서버 동기화가 생기면 위시리스트 소유권이 어떻게 달라지는지
- 새로고침·URL 공유·앞뒤 이동·페이지 이동 검증 결과
