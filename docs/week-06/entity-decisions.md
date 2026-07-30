# `product`와 `category` 슬라이스 분리 판단

## 결론

현재 프로젝트에서는 `product`와 `category`를 별도 entity로 분리하지 않고 **`entities/product` 한 슬라이스로 구성한다.**

현재 Category는 상품을 분류하고 상품 조회 조건을 표현하는 값으로만 사용된다. 독립적인 API·상태·수명주기·비즈니스 행위가 없으므로, 별도 entity로 분리해서 얻는 독립성보다 슬라이스 간 타입 의존과 탐색 비용이 더 크다고 판단했다.

```text
entities/product/
├── model/
│   ├── product.ts
│   └── category.ts
└── ui/
    └── ProductCard.tsx
```

Category에 독립적인 변경 이유가 생기면 `entities/category` 분리를 다시 검토한다.

## 판단 근거

현재 코드에서 Category가 맡는 역할은 다음과 같다.

- `Category`는 `id`, `name`만 가진다.
- `Product.category`가 `CategoryId`를 상품 분류값으로 사용한다.
- 카테고리 목록은 홈과 상품 목록 응답에 상품 데이터와 함께 포함된다.
- 카테고리 선택 결과는 상품 목록의 조회 조건 변경으로 이어진다.
- 카테고리만의 API·상태·상세 화면·관리 정책은 없다.

이 상태에서 두 entity를 분리하면 `Product.category`를 표현하기 위해 `product`가 `category`의 타입을 참조해야 한다. 제한적인 `@x` 타입 공개로 해결할 수는 있지만, 현재는 분리 필요성이 약한데도 구조적 예외와 탐색 경로만 늘어난다.

슬라이스는 명사 개수에 맞춰 기계적으로 나누지 않는다. 서로 독립적으로 변경되는 도메인인지, 각자 고유한 상태와 행위를 갖는지를 기준으로 나눈다.

## entity 협력 코드의 배치 원칙

두 entity를 별도로 유지해야 하는 경우에도 서로의 일반 Public API나 내부 경로를 직접 참조하지 않는다. 두 entity가 협력하는 책임은 협력의 성격에 맞는 상위 레이어가 소유한다.

### 사용자 목적을 수행하는 비즈니스 행위

두 entity를 이용해 사용자의 명확한 목적을 수행하는 로직은 `features`에 둔다.

예를 들어 사용자가 카테고리를 선택해 상품 조회 조건을 바꾸는 기능을 재사용 가능한 행위로 정의한다면 `features/filter-products`가 관련 entity의 공개 계약을 사용한다. 이때 entity 자체를 feature로 옮기는 것이 아니라 **협력 로직만 feature가 소유한다.**

다만 클릭이나 이벤트가 있다는 이유만으로 무조건 feature가 되는 것은 아니다. 해당 상품 목록 페이지에서만 사용하는 단순 URL 상태 조합이라면 `_pages/product-list/model`이 더 적절할 수 있다.

### 독립적인 복합 UI

여러 entity나 feature를 조합해 독립적으로 재사용할 수 있는 큰 UI 블록은 `widgets`에 둔다. 특정 페이지에서만 의미가 있는 조합은 widget을 추가하지 않고 해당 `_pages` 슬라이스에서 조합한다.

entity UI 하나를 감싸거나 두 데이터를 함께 렌더링한다는 이유만으로 widget을 만들지 않는다.

### 공통 타입과 유틸리티

`Id`, `Timestamp`처럼 도메인 의미가 없는 기반 타입이나 범용 유틸리티만 `shared`로 내린다.

`CategoryId`, 상품 정렬 조건처럼 상품 도메인의 의미를 가진 타입은 여러 곳에서 사용하더라도 `shared`로 옮기지 않는다. 재사용 횟수가 아니라 도메인 소유권을 기준으로 배치한다.

## entity 간 타입 참조 예외

같은 레이어의 다른 entity 슬라이스를 일반 Public API나 내부 경로로 직접 참조하는 것은 금지한다. 단, 분리된 entity의 타입이 꼭 필요하다면 제공 entity가 소비 entity 전용 `@x/<consumer>` 경로로 필요한 타입만 공개할 수 있다.

예를 들어 향후 `category`를 독립 entity로 분리하고 `product`가 `CategoryId`를 사용해야 한다면 다음과 같이 제한한다.

```text
entities/category/
└── @x/
    └── product.ts  # CategoryId 타입만 named export
```

`@x`에서는 타입만 공개하며 UI·store·API 호출 같은 런타임 구현은 공개하지 않는다. 예외가 늘어나면 `@x`를 확대하기 전에 두 entity의 도메인 소유권과 분리 필요성을 다시 검토한다.

## 분리를 재검토할 조건

다음 중 하나가 생기면 `entities/category` 분리를 검토한다.

- 카테고리 전용 조회·수정 API가 생긴다.
- 카테고리가 상품과 독립적인 상태나 정책을 가진다.
- 카테고리 상세·관리 등 독립 화면이 생긴다.
- 상품과 무관한 여러 기능에서 카테고리를 소비한다.
- product와 category가 서로 다른 이유와 주기로 변경된다.

분리 후 두 entity를 조합하는 위치는 다시 책임에 따라 결정한다.

- 사용자 목적을 수행하는 행위: `features`
- 독립적인 복합 UI: `widgets`
- 라우트 전용 조합: `_pages`
- 도메인 비종속 기반 코드: `shared`
