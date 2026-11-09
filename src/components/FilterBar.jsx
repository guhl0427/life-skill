import { useApp } from "../context/useApp"

const chipBase =
  "cursor-pointer whitespace-nowrap rounded-sketch border-2 px-3.5 py-1 text-[13px] transition-all duration-200 max-md:shrink-0 max-[480px]:px-2.5 max-[480px]:text-xs"
const chipIdle = "border-line bg-card text-ink-soft hover:border-primary hover:text-primary"
const chipActive = "border-primary-hover bg-primary text-white shadow-[1px_2px_0_var(--line)]"

export default function FilterBar({ activeCat, onCatChange, activeStarred, onStarredChange, sort, onSortChange }) {
  const { categories } = useApp()

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 max-md:flex-nowrap max-md:gap-2">
      <span className="mr-1 shrink-0 font-hand text-sm text-ink-faint">分类</span>
      <div className="filter-scroll flex flex-1 items-center gap-3 max-md:min-w-0">
        <div className="flex flex-wrap gap-2 max-md:flex-nowrap max-md:shrink-0">
          <button
            type="button"
            className={`${chipBase} ${!activeCat && !activeStarred ? chipActive : chipIdle}`}
            onClick={() => onCatChange("")}
          >
            全部
          </button>
          <button
            type="button"
            className={`${chipBase} ${activeStarred ? chipActive : chipIdle}`}
            onClick={() => onStarredChange?.()}
            aria-pressed={!!activeStarred}
          >
            ⭐ 已收藏
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${chipBase} ${activeCat === cat.id ? chipActive : chipIdle}`}
              style={activeCat === cat.id ? { background: cat.color, borderColor: cat.color } : undefined}
              onClick={() => onCatChange(cat.id)}
              aria-pressed={activeCat === cat.id}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <select
        className="select-arrow shrink-0 cursor-pointer appearance-none rounded-sketch border-2 border-line bg-card py-1 pl-3.5 pr-9 text-[13px] text-ink-soft transition-colors duration-200 max-[480px]:py-0.5 max-[480px]:pl-2.5 max-[480px]:text-xs"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="排序方式"
      >
        <option value="newest">最新</option>
        <option value="oldest">最早</option>
        <option value="title">标题 A-Z</option>
      </select>
    </div>
  )
}
