# 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/ko/) 기반, 한글로 작성한다.

## 형식

```
<type>(<scope>): <subject>

<body>
```

- `<scope>`와 `<body>`는 선택
- `<subject>`는 한글로 작성, 마침표 생략, 50자 이내

## type

| type       | 용도                                    |
| ---------- | --------------------------------------- |
| `feat`     | 새로운 기능 추가                        |
| `fix`      | 버그 수정                               |
| `refactor` | 기능 변경 없는 코드 개선                |
| `style`    | 포맷팅, 세미콜론 등 코드 의미 변경 없음 |
| `docs`     | 문서 추가·수정                          |
| `test`     | 테스트 추가·수정                        |
| `chore`    | 빌드, 패키지, 설정 등 기타 변경         |
| `perf`     | 성능 개선                               |
| `ci`       | CI/CD 설정 변경                         |

## scope (선택)

변경 대상의 FSD 레이어나 슬라이스를 기입한다.

```
feat(auth): 로그인 폼 유효성 검증 추가
fix(shared/ui): Button 컴포넌트 다크모드 스타일 수정
refactor(entities/user): 유저 타입 정의 통합
```

## 예시

```
feat: 게시글 목록 무한 스크롤 구현
fix: 검색 결과 빈 배열일 때 에러 바운더리 작동하지 않는 문제 수정
refactor(shared/api): API 클라이언트 에러 핸들링 일원화
docs: 커밋 컨벤션 문서 추가
chore: eslint, prettier 초기 설정
```

## body (선택)

- "무엇을" 보다 "왜"를 기술
- 한 줄 72자 이내 권장

```
fix(features/post): 게시글 수정 시 낙관적 업데이트 롤백 누락

이전 데이터를 onMutate에서 저장하지 않아 onError 시
원복이 불가능했던 문제를 수정
```

## Breaking Change

- `!`를 type 뒤에 붙이거나 footer에 `BREAKING CHANGE:` 기입

```
feat!: 인증 방식을 세션에서 JWT로 변경

BREAKING CHANGE: 기존 세션 기반 로그인 API 제거
```
