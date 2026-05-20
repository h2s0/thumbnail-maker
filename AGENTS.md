# Repository Guidelines

## Project Structure & Module Organization

This repository is a buildless static web app for making blog thumbnails.

- `index.html` contains markup, metadata, controls, and script/style links.
- `style.css` contains layout, responsive styling, font declarations, and UI state styles.
- `script.js` contains canvas rendering, image uploads, text wrapping, control state, and JPG download logic.
- `README.md` describes the product, features, and local run options.
- `og.png`, `robots.txt`, `sitemap.xml`, and `CNAME` support deployment, SEO, and social previews.

There is no separate `src/`, `tests/`, or asset pipeline. Keep additions simple unless a build step becomes clearly necessary.

## Build, Test, and Development Commands

No install step is required.

```bash
open index.html
```

Opens the app directly in a browser. On Linux, use your browser or `xdg-open index.html`.

```bash
npx serve .
```

Serves the static files locally for checks closer to production hosting.

There is no build command; deploy the repository root as static files.

## Coding Style & Naming Conventions

Use vanilla HTML, CSS, and JavaScript. Follow existing style:

- Two-space indentation in HTML.
- CSS variables in `:root` for shared design values.
- Single quotes in JavaScript strings.
- `camelCase` for JavaScript variables and functions, such as `currentFont` and `updateSquareOverlay`.
- Descriptive CSS class names in kebab case, such as `.canvas-wrapper` and `.pos-grid-picker`.

Keep UI text consistent with the Korean copy. Prefer small, direct changes over framework code.

## Testing Guidelines

There is no automated test framework. Verify changes manually in a browser:

- Upload an image and confirm the canvas preview renders.
- Edit text, font, color, border, darkness, font size, and text position.
- Toggle `1:1 미리보기`.
- Download a JPG and confirm the filename and image are correct.
- Check mobile and desktop widths after CSS changes.

## Commit & Pull Request Guidelines

Recent commits use short Korean messages, with occasional prefixes such as `fix:`. Match that style, for example:

- `텍스트 위치 변경 기능 추가`
- `fix: 파일 저장 이름 수정`

Pull requests should include a concise summary, screenshots or recordings for UI changes, manual test notes, and deployment or SEO impact. Link related issues when applicable.

## Security & Configuration Tips

Do not commit user-uploaded sample images unless needed for docs. When changing `CNAME`, canonical URLs, `sitemap.xml`, or social metadata, verify they still point to `https://thumbnail.heeso.site/`.
