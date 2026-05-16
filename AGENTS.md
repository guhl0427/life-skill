# LifeSkill — AGENTS.md

## Commands

```sh
npm run dev      # dev server at localhost:5173
npm run build    # production build to dist/
npm run lint     # eslint (JSX, not TS)
npm run preview  # preview production build
```

No test framework, type checker, or CI configured.

## Architecture

- **JSX only** — `.jsx` extension, no TypeScript, no type checking
- **React Context** — single `AppContext` holds all state (tips, categories, tags); no Redux/Zustand
- **localStorage** — `useLocalStorage` hook auto-syncs on state change; keys prefixed `ls_`
- **Routing** — `react-router-dom` v7 with 6 flat routes; search/filter via `URLSearchParams`
- **Single CSS file** — `src/index.css` contains all styles including hand-drawn effects
- **No UI library** — all components custom with CSS Variables

## Data model (src/data/seed.js)

| Entity | Fields | localStorage key |
|---|---|---|
| Tip | id, title, content, categoryId, tagIds[], createdAt, updatedAt | `ls_tips` |
| Category | id, name, emoji, color | `ls_categories` |
| Tag | id, name | `ls_tags` |

## Key conventions

- **Imports**: No braces around default imports (React style)
- **CSS**: All in `src/index.css`; never add separate `.css` files per component
- **Hand-drawn style**: ZCOOL KuaiLe font via Google Fonts; card rotation via `:nth-child`; SVG `feTurbulence` filter in `index.html`
- **Date format**: `yyyy/MM/dd` (no external date library)
- **ID gen**: `Date.now().toString(36)` + counter in `AppContext`
- **Seed data**: 6 tips, 5 categories, 6 tags — loaded on first visit

## Project structure

```
src/
├── context/AppContext.jsx    # single source of truth, all CRUD methods
├── components/               # Layout, TipCard, TipForm, FilterBar, ConfirmDialog
├── pages/                    # Home, NewTip, EditTip, TipDetail, Categories, Tags
├── data/seed.js              # initial seed data
├── hooks/useLocalStorage.js  # persistence hook
├── index.css                 # all styles
├── App.jsx                   # route definitions
└── main.jsx                  # entry point (BrowserRouter + AppProvider)
```

## Routes

| Path | Page | Key behavior |
|---|---|---|
| `/` | Home | Reads `?cat=`, `?q=` from URL; card grid + filters + sort |
| `/tips/new` | NewTip | Form submits → creates tip → navigates to `/` |
| `/tips/:id` | TipDetail | Full detail + edit/delete actions |
| `/tips/:id/edit` | EditTip | Pre-filled form → updates → navigates back to detail |
| `/categories` | Categories | Inline edit mode; delete cascades categoryId→null on tips |
| `/tags` | Tags | Inline edit mode; delete removes tagId from all tips' tagIds |

## Notable quirks

- Deleting a category or tag cascades to all tips (sets categoryId to null / removes tagId from array) — see `AppContext.jsx`
- Search is URL-based (`?q=`), not real-time — submitted via form in Layout top bar
- Random card rotation uses `:nth-child(3n|5n|7n)` pseudo-selectors in CSS, not JS
- Google Fonts (ZCOOL KuaiLe + Caveat) loaded via `@import` in `index.css`; new fonts must be added there
