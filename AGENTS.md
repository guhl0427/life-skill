# LifeSkill — AGENTS.md

## Commands

```sh
npm run dev      # dev server at localhost:5173
npm run build    # production build to dist/
npm run lint     # oxlint (JSX, not TS)
npm test         # vitest run
npm run test:watch
npm run preview  # preview production build
```

No type checker. CI (`.github/workflows/ci.yml`) runs lint + test + build on Node 24.

## Architecture

- **JSX only** — `.jsx` extension, no TypeScript, no type checking
- **React Context** — a single `AppProvider` holds all state (tips, categories, tags); `useApp` lives in `src/context/useApp.js` so the provider file stays fast-refresh friendly
- **localStorage** — `useLocalStorage` hook auto-syncs on state change; keys prefixed `ls_`; listens to `storage` events so multiple tabs stay in sync; write failures dispatch a `ls-storage-error` event that Layout renders as a banner
- **Routing** — `react-router-dom` v7 with 8 flat routes; search/filter/sort via `URLSearchParams`
- **Tailwind CSS 4** — set up through `@tailwindcss/vite`; design tokens in `index.css` via `@theme inline`, dark mode via `data-theme="dark"`

## Data model (src/data/seed.js)

| Entity | Fields | localStorage key |
|---|---|---|
| Tip | id, title, content, categoryId, tagIds[], starred, createdAt, updatedAt | `ls_tips` |
| Category | id, name, emoji, color | `ls_categories` |
| Tag | id, name | `ls_tags` |

## Key conventions

- **Imports**: No braces around default imports (React style)
- **Styling**: Tailwind utility classes directly in JSX; shared/button/field class strings live in `src/components/ui.js`
- **index.css**: only Tailwind import, theme variables, base resets, and hand-drawn effects in `@layer components` (card rotation, animations, sidebar drawer). Never add per-component `.css` files
- **Design tokens**: colors map to `--color-*` (paper, paper-deep, card, primary, accent, danger, ink, ink-soft, ink-faint, line, line-soft); fonts to `font-display` / `font-hand`; shadows to `shadow-ink` / `shadow-ink-hover`
- **Hand-drawn style**: ZCOOL KuaiLe font via Google Fonts `@import`; card rotation via `:nth-child`; SVG `feTurbulence` filter in `index.html`
- **Date format**: `yyyy/MM/dd` via `src/utils/format.js` (no external date library)
- **ID gen**: `Date.now().toString(36)` + counter in `AppProvider`
- **Seed data**: 6 tips, 5 categories, 6 tags — loaded on first visit

## Project structure

```
src/
├── context/
│   ├── app-context.js        # createContext object
│   ├── useApp.js             # consumer hook
│   ├── AppContext.jsx        # AppProvider, all CRUD methods, categoryMap/tagMap
│   └── AppContext.test.jsx
├── components/               # Layout, TipCard, TipForm, FilterBar, ConfirmDialog, ui.js
├── pages/                    # Home, NewTip, EditTip, TipDetail, Categories, Tags, Stats, NotFound
├── data/seed.js              # initial seed data
├── hooks/useLocalStorage.js  # persistence + cross-tab sync hook
├── utils/format.js           # formatDate / formatDateTime
├── utils/backup.js           # buildBackup / parseBackup validation
├── test/setup.js             # jest-dom matchers
├── index.css                 # Tailwind entry + theme + hand-drawn effects
├── App.jsx                   # route definitions
└── main.jsx                  # entry point (BrowserRouter + AppProvider)
```

## Routes

| Path | Page | Key behavior |
|---|---|---|
| `/` | Home | Reads `?cat=`, `?q=`, `?starred=`, `?sort=` from URL; card grid + filters + sort |
| `/tips/new` | NewTip | Form submits → creates tip → navigates to `/` |
| `/tips/:id` | TipDetail | Full detail + edit/delete/copy actions |
| `/tips/:id/edit` | EditTip | Pre-filled form (keyed by tip id) → updates → navigates back |
| `/categories` | Categories | Inline edit mode; duplicate names rejected; delete cascades categoryId→null on tips |
| `/tags` | Tags | Inline edit mode; duplicate names rejected; delete removes tagId from all tips' tagIds |
| `/stats` | Stats | Totals, per-category bars, top 5 tags |
| `*` | NotFound | Fallback for unknown paths |

## Notable quirks

- Deleting a category or tag cascades to all tips (sets categoryId to null / removes tagId) — covered by `AppContext.test.jsx`
- Category and starred filters compose (both can be active at once)
- Search is URL-based (`?q=`), submitted via the top-bar form; the input is keyed by `location.key` so it resets on navigation
- Random card rotation uses `:nth-child(3n|5n|7n)` pseudo-selectors in `index.css`
- Dark mode is applied by an inline script in `index.html` before React mounts to avoid a flash
- `selected`/`active` states are passed as `aria-pressed`, and clickable chips/tags are real `<button>` elements
- Backup export/import lives on Home (`utils/backup.js`); import replaces all data after confirmation
- Static hosting needs an SPA fallback: `vercel.json` and `public/_redirects` cover Vercel and Netlify
