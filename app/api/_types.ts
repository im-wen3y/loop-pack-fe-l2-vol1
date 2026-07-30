// mock 백엔드 전용 타입. scenario는 검증용 제어값이라 클라이언트가 보내지 않고,
// 프론트엔드 레이어의 계약도 아니라서 Route Handler 곁에 둔다.
export type MockApiScenario = 'empty' | 'error'

export type ApiErrorResponse = {
  message: string
}
