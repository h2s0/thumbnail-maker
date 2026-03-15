---
name: vanilla-js
description: 바닐라 자바스크립트(Vanilla JavaScript)로 코드를 작성할 때 반드시 사용하는 스킬. 사용자가 "바닐라 JS", "순수 자바스크립트", "프레임워크 없이", "vanilla", "DOM 조작", "이벤트 리스너", "fetch API", "ES모듈" 등을 언급하거나, React/Vue/Angular 없이 JS 코드를 요청하는 경우 이 스킬을 반드시 참조할 것. HTML/CSS와 함께 JS를 작성하는 경우에도 적용.
---

# Vanilla JavaScript 코드 작성 가이드

프레임워크 없이 순수 자바스크립트로 작성하는 코드의 원칙과 패턴을 정의한다.
이 스킬의 목표는 **읽기 쉽고, 유지보수 가능하며, 브라우저 호환성이 높은** 코드를 일관되게 생성하는 것이다.

---

## 핵심 원칙

- **`var` 절대 사용 금지** — `const`를 기본으로, 재할당이 필요한 경우만 `let` 사용
- **전역 변수 최소화** — 모든 코드는 스코프 안에 가둘 것
- **`innerHTML`로 사용자 입력 삽입 금지** — XSS 위험. `textContent` 또는 `createElement` 사용
- **콜백 지옥 금지** — `async/await` 사용
- **`==` 사용 금지** — 항상 `===` 사용

---

## DOM 조작

### 요소 선택
```js
// 단일 요소
const btn = document.querySelector('#submit-btn');

// 복수 요소 (NodeList → 배열로 변환)
const items = [...document.querySelectorAll('.item')];
```

### 요소 생성 및 삽입
```js
// 안전한 방법 (XSS 방지)
const li = document.createElement('li');
li.textContent = userInput; // innerHTML 절대 사용 금지
ul.appendChild(li);

// 여러 요소 한 번에 삽입할 때는 Fragment 활용
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const el = document.createElement('div');
  el.textContent = item.name;
  fragment.appendChild(el);
});
container.appendChild(fragment); // DOM 업데이트 1회
```

### 클래스 조작
```js
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('open');
el.classList.contains('active'); // boolean 반환
```

---

## 이벤트 처리

### 기본 패턴
```js
// addEventListener 사용 (onclick 속성 방식 금지)
btn.addEventListener('click', handleClick);

function handleClick(event) {
  event.preventDefault(); // 필요한 경우
  // 로직
}
```

### 이벤트 위임 (Event Delegation)
동적으로 추가되는 요소나 다수의 자식 요소에는 반드시 이벤트 위임 사용:
```js
// Bad: 각 버튼마다 리스너 추가
buttons.forEach(btn => btn.addEventListener('click', handler));

// Good: 부모에 하나만 등록
list.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  handleDelete(btn.dataset.id);
});
```

### 메모리 누수 방지
컴포넌트 제거 시 이벤트 리스너도 함께 제거:
```js
const controller = new AbortController();
el.addEventListener('click', handler, { signal: controller.signal });

// 정리할 때
controller.abort(); // 연결된 모든 리스너 한 번에 제거
```

---

## 비동기 처리

### fetch 기본 패턴
```js
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch 실패:', error);
    throw error; // 호출부에서 처리하도록 재던지기
  }
}
```

### 병렬 요청
```js
// 순차 실행 (느림)
const user = await fetchUser(id);
const posts = await fetchPosts(id);

// 병렬 실행 (빠름)
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);
```

---

## 모듈 구조

### ES Modules 사용
```html
<!-- HTML에서 -->
<script type="module" src="main.js"></script>
```

```js
// utils.js
export function formatDate(date) { ... }
export const API_URL = 'https://api.example.com';

// main.js
import { formatDate, API_URL } from './utils.js';
```

### 단일 파일일 때: IIFE 패턴으로 스코프 보호
```js
(() => {
  // 전역 오염 없이 코드 실행
  const state = { count: 0 };

  function init() { ... }

  init();
})();
```

---

## 상태 관리

### 단순한 중앙 상태 객체
```js
const state = {
  todos: [],
  filter: 'all',
  isLoading: false,
};

// 상태 직접 수정 금지 — 함수를 통해서만 변경
function setState(newState) {
  Object.assign(state, newState);
  render(); // 상태 변경 시 항상 리렌더링
}
```

### 상태 변경 → 렌더링 분리
```js
function render() {
  const filtered = getFilteredTodos(state);
  todoList.innerHTML = ''; // 안전: 사용자 입력이 아닌 내부 데이터
  filtered.forEach(todo => {
    todoList.appendChild(createTodoEl(todo));
  });
}
```

---

## 성능

### DOM 접근 캐싱
```js
// Bad: 루프마다 DOM 쿼리
for (let i = 0; i < 1000; i++) {
  document.querySelector('#list').style.color = 'red';
}

// Good: 한 번만 조회
const list = document.querySelector('#list');
for (let i = 0; i < 1000; i++) {
  list.style.color = 'red';
}
```

### Debounce / Throttle
```js
// 검색 입력, 리사이즈 이벤트 등에 반드시 적용
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

searchInput.addEventListener('input', debounce(handleSearch, 300));
```

### IntersectionObserver (무한 스크롤 / 레이지 로딩)
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) loadMore();
  });
}, { threshold: 0.1 });

observer.observe(sentinel);
```

---

## 에러 처리

- 모든 `async` 함수는 `try/catch` 필수
- 에러는 콘솔에만 남기지 말고 **UI에 사용자 피드백** 제공
- 예상 가능한 에러는 `if` 분기, 예외적 상황은 `throw`

```js
function showError(message) {
  const el = document.querySelector('#error-msg');
  el.textContent = message;
  el.hidden = false;
}
```

---

## 데이터 속성 활용

JS와 HTML 간 데이터 전달 시 `data-*` 속성 활용:
```html
<button class="delete-btn" data-id="42" data-name="항목">삭제</button>
```
```js
btn.addEventListener('click', (e) => {
  const { id, name } = e.currentTarget.dataset;
  deleteItem(id, name);
});
```

---

## 로컬 스토리지

```js
// 저장
localStorage.setItem('key', JSON.stringify(data));

// 불러오기 (파싱 실패 대비)
function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
```

---

## 금지 패턴 요약

| 하지 말 것 | 대신 |
|---|---|
| `var` | `const` / `let` |
| `element.innerHTML = userInput` | `element.textContent = userInput` |
| `==` | `===` |
| 콜백 중첩 | `async/await` |
| 전역 변수 남발 | 모듈 / IIFE 스코프 |
| 루프 안에서 DOM 쿼리 | 루프 밖에서 캐싱 |
| 이벤트 리스너 미제거 | `AbortController` 또는 `removeEventListener` |
| `onclick="..."` 인라인 | `addEventListener` |