# 데이터 페칭 컨벤션 (TanStack Query v5)

서버 상태 관리는 [TanStack Query](https://tanstack.com/query/latest) v5를 사용한다.

## Provider 설정 (`app/` 레이어)

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});
```

## v5 핵심 규칙

- 쿼리 옵션은 **단일 객체**로만 전달: `useQuery({ queryKey, queryFn })`
- `onSuccess`, `onError`, `onSettled` 콜백 제거됨 — 부수효과는 mutation 콜백이나 컴포넌트에서 처리
- `status: 'loading'` → `status: 'pending'`, `isLoading` → 초기 로딩만
- `cacheTime` → `gcTime`

## FSD 구조에서의 배치

```
features/post/
├── api/
│   ├── postApi.ts        # fetch 함수
│   ├── postQueries.ts    # queryOptions, mutationOptions
│   └── types.ts          # 요청/응답 타입
├── ui/
│   └── PostList.tsx
├── model/
│   └── usePostActions.ts # mutation 래핑 훅 (필요 시)
└── index.ts
```

## 쿼리 키 — `queryOptions` 팩토리 패턴

```tsx
// features/post/api/postQueries.ts
import { queryOptions } from '@tanstack/react-query';
import { fetchPosts, fetchPostById } from './postApi';

export const postQueries = {
  all: () =>
    queryOptions({
      queryKey: ['posts'],
      queryFn: fetchPosts,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: ['posts', id],
      queryFn: () => fetchPostById(id),
      enabled: !!id,
    }),
  list: (params: PostListParams) =>
    queryOptions({
      queryKey: ['posts', 'list', params],
      queryFn: () => fetchPosts(params),
    }),
};
```

## 사용

```tsx
import { useQuery } from '@tanstack/react-query';
import { postQueries } from '../api/postQueries';

function PostList() {
  const { data, isPending, error } = useQuery(postQueries.all());
  // ...
}
```

## Mutation 패턴

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/postApi';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

## Suspense 모드

React 19의 `<Suspense>`와 함께 사용:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

function PostList() {
  const { data } = useSuspenseQuery(postQueries.all());
  // data는 항상 존재 (undefined 아님)
  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 낙관적 업데이트

```tsx
useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries({ queryKey: ['posts', newPost.id] });
    const previous = queryClient.getQueryData(['posts', newPost.id]);
    queryClient.setQueryData(['posts', newPost.id], newPost);
    return { previous };
  },
  onError: (_err, _newPost, context) => {
    if (context?.previous) {
      queryClient.setQueryData(['posts', context.previous.id], context.previous);
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  },
});
```

## 무한 스크롤

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['posts', 'infinite'],
  queryFn: ({ pageParam }) => fetchPosts({ cursor: pageParam }),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
```

## 주의 사항

- `queryFn` 안에서 상태를 변경하지 않을 것 — 순수 데이터 fetch만
- `queryKey`에 의존하는 모든 변수를 포함할 것
- `enabled: false`일 때 `data`는 `undefined` — 타입 가드 필요
- DevTools는 개발 환경에서만 포함
