---
name: css
description: CSS 코드를 작성할 때 반드시 참조하는 스킬. 사용자가 CSS, 스타일시트, 스타일링, 레이아웃, 반응형, 애니메이션, 커스텀 프로퍼티, 다크모드 등을 언급하거나, HTML/JS와 함께 스타일 코드를 작성하는 모든 경우에 적용. SCSS/Sass 작업 시에도 기본 원칙은 동일하게 적용.
---

# CSS 작성 가이드

읽기 쉽고, 재사용 가능하며, 유지보수가 쉬운 CSS를 일관되게 작성하기 위한 원칙.
핵심 철학은 두 가지다: **과하게 쓰지 말 것**, **반복하지 말 것**.

---

## 커스텀 프로퍼티 (CSS 변수) 우선

색상, 간격, 폰트 등 반복되는 값은 반드시 변수로 정의. 값을 직접 쓰는 건 변수로 추상화할 수 없는 경우만.

```css
/* Bad */
.btn { background: #3b82f6; padding: 8px 16px; border-radius: 6px; }
.card { border: 1px solid #3b82f6; border-radius: 6px; }

/* Good */
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-text: #111827;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 12px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;

  --font-body: 'Pretendard', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,.12);

  --transition: 150ms ease;
}
```

변수 이름은 **의미** 기준으로 작명 (`--color-primary`, `--space-4`). 값 기준 작명 금지 (`--blue`, `--16px`).

---

## 재사용: 유틸리티 클래스 vs 컴포넌트 클래스

### 유틸리티 클래스 — 단일 속성 하나만 담당
```css
.flex       { display: flex; }
.flex-col   { flex-direction: column; }
.items-center { align-items: center; }
.gap-2      { gap: var(--space-2); }
.hidden     { display: none; }
.sr-only    { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
```

### 컴포넌트 클래스 — 의미 있는 단위로 묶기
```css
/* 상태별로 분리, 수정자(modifier) 패턴 활용 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: background var(--transition);
  cursor: pointer;
  border: none;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover {
  background: var(--color-primary-hover);
}

.btn--ghost {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--text-sm); }
.btn--lg { padding: var(--space-3) var(--space-6); font-size: var(--text-lg); }
```

규칙: **기본 클래스 → 변형(modifier) → 상태(state)** 순서로 선언.

---

## 과하게 쓰지 않기

### 셀렉터 깊이 최대 3단계
```css
/* Bad - 너무 깊고 HTML 구조에 종속됨 */
.sidebar .nav ul li a.active span { color: red; }

/* Good */
.nav-link--active { color: var(--color-primary); }
```

### !important 금지
`!important`는 다른 스타일을 덮을 수 없을 때 쓰고 싶어지지만, 그 순간 스타일 우선순위가 무너진다.
유일한 예외: `.sr-only` 같은 접근성 유틸리티, 또는 써드파티 스타일 강제 오버라이드.

### 불필요한 속성 제거
```css
/* Bad - block 요소에 width: 100%는 기본값 */
div { display: block; width: 100%; margin: 0 auto; }

/* Bad - flex 자식에 불필요한 float */
.flex-container > * { float: left; }
```

### 과도한 애니메이션 금지
```css
/* Bad - 모든 속성에 transition */
* { transition: all 0.3s ease; }

/* Good - 필요한 속성만 */
.btn { transition: background var(--transition), box-shadow var(--transition); }
```

---

## 레이아웃

### Flexbox — 1차원 배치
```css
.card-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap; /* 넘칠 때 줄바꿈 */
}
```

### Grid — 2차원 배치
```css
.page-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

/* 반응형 카드 그리드 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
```

`float`으로 레이아웃 잡는 것은 금지. flex/grid 사용.

---

## 반응형

### Mobile-first 원칙
작은 화면 기준으로 먼저 작성하고, `min-width`로 확장:

```css
/* 기본: 모바일 */
.container {
  padding: var(--space-4);
  flex-direction: column;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
    flex-direction: row;
  }
}

/* 데스크탑 이상 */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
    margin-inline: auto;
  }
}
```

고정 px 대신 `clamp()`로 유동적 크기:
```css
/* 뷰포트에 따라 1rem~1.5rem 사이에서 자동 조정 */
h1 { font-size: clamp(1rem, 2.5vw, 1.5rem); }
```

---

## 다크 모드

시스템 설정 기반 자동 전환:
```css
:root {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-surface: #f9fafb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-text: #f1f5f9;
    --color-surface: #1e293b;
  }
}
```

수동 토글이 필요하면 `data-theme` 속성으로 제어:
```css
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
}
```

---

## 접근성

```css
/* 포커스 스타일 절대 제거 금지 */
/* Bad */
*:focus { outline: none; }

/* Good - 커스텀 포커스 링 */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 모션 줄이기 설정 존중 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 파일 구조 (규모가 커질 때)

```
styles/
├── base.css        — reset, :root 변수, 기본 타이포그래피
├── layout.css      — 페이지 레이아웃, 그리드, 컨테이너
├── components/
│   ├── button.css
│   ├── card.css
│   └── form.css
├── utilities.css   — 유틸리티 클래스
└── main.css        — 위 파일들 @import
```

단일 파일이라면 이 순서로 섹션 구분:
```css
/* 1. 변수 (:root) */
/* 2. Reset / Base */
/* 3. 레이아웃 */
/* 4. 컴포넌트 */
/* 5. 유틸리티 */
/* 6. 미디어 쿼리 */
```

---

## Reset 기본값

프로젝트 시작 시 항상 포함:
```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

img, video, svg {
  display: block;
  max-width: 100%;
}

button, input, select, textarea {
  font: inherit; /* 폼 요소에 body 폰트 상속 */
}

a {
  color: inherit;
  text-decoration: none;
}
```

---

## 금지 패턴 요약

| 하지 말 것 | 대신 |
|---|---|
| `!important` 남발 | 선택자 우선순위 조정 |
| `* { transition: all }` | 필요한 속성만 지정 |
| 색상/크기 하드코딩 반복 | CSS 변수 |
| 셀렉터 4단계 이상 중첩 | 클래스 분리 |
| `float`으로 레이아웃 | flex / grid |
| `*:focus { outline: none }` | `:focus-visible` 커스텀 |
| `px`만 사용한 폰트/간격 | `rem` + CSS 변수 |
| 모바일 마지막에 추가 | mobile-first |