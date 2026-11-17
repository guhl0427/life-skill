import { useApp } from "../context/useApp"

const chipBase =
  "cursor-pointer whitespace-nowrap rounded-sketch border-2 px-3.5 py-1 text-[13px] transition-all duration-200 max-md:shrink-0 max-[480px]:px-2.5 max-[480px]:text-xs"
const chipIdle = "border-line bg-card text-ink-soft hover:border-primary hover:text-primary"
const chipActive = "border-primary bg-primary-light font-medium text-ink shadow-[1px_2px_0_var(--line-soft)]"
const chipExtra =
  "flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-sketch border-2 border-primary bg-primary-light px-3 py-1 text-[13px] text-ink transition-colors duration-200 hover:text-primary max-md:shrink-0 max-[480px]:px-2.5 max-[480px]:text-xs"

export default function FilterBar({
  activeCat,
  onCatChange,
  activeStarred,
  onStarredChange,
  activeTag,
  activeTagName,
  untagged,
  uncategorized,
  onClearTag,
  onClearExtra,
  onReset,
  sort,
  onSortChange,
}) {
  const { categories } = useApp()
  const isAll = !activeCat && !activeStarred && !activeTag && !untagged && !uncategorized

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${chipBase} ${isAll ? chipActive : chipIdle}`}
            onClick={() => onReset?.()}
            aria-pressed={isAll}
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
          {activeTag && (
            <button
              type="button"
              className={chipExtra}
              onClick={onClearTag}
              aria-label={`清除标签筛选：${activeTagName}`}
            >
              #{activeTagName}
              <span aria-hidden="true" className="text-[11px]">✕</span>
            </button>
          )}
          {(untagged || uncategorized) && (
            <button
              type="button"
              className={chipExtra}
              onClick={onClearExtra}
              aria-label={`清除${untagged ? "无标签" : "未分类"}筛选`}
            >
              {untagged ? "无标签" : "未分类"}
              <span aria-hidden="true" className="text-[11px]">✕</span>
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${chipBase} ${activeCat === cat.id ? chipActive : chipIdle}`}
              style={activeCat === cat.id ? { background: cat.color + "2E", borderColor: cat.color } : undefined}
              onClick={() => onCatChange(cat.id)}
              aria-pressed={activeCat === cat.id}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      <select
        className="select-arrow shrink-0 cursor-pointer appearance-none rounded-sketch border-2 border-line bg-card py-1 pl-3.5 pr-9 text-[13px] text-ink-soft transition-colors duration-200 max-md:ml-0 max-md:w-full max-[480px]:py-0.5 max-[480px]:pl-2.5 max-[480px]:text-xs"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="排序方式"
      >
        <option value="newest">最新</option>
        <option value="updated">最近更新</option>
        <option value="most">最常用</option>
        <option value="oldest">最早</option>
        <option value="title">标题 A-Z</option>
      </select>
    </div>
  )
}
