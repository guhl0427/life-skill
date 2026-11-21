import { useMemo, useState } from "react"
import { useApp } from "../context/useApp"
import Select from "./Select"

const CAT_PREVIEW = 10

const chipBase =
  "cursor-pointer whitespace-nowrap rounded-sketch border-2 px-3.5 py-1 text-[13px] transition-all duration-200 max-md:shrink-0 max-[480px]:px-2.5 max-[480px]:text-xs"
const chipIdle = "border-line bg-card text-ink-soft hover:border-primary hover:text-primary"
const chipActive = "border-primary bg-primary-light font-medium text-ink shadow-[1px_2px_0_var(--line-soft)]"
const chipMore =
  "cursor-pointer whitespace-nowrap rounded-sketch border-2 border-dashed border-line bg-paper-deep px-3.5 py-1 text-[13px] text-ink-faint transition-colors duration-200 hover:border-primary hover:text-primary max-md:shrink-0 max-[480px]:px-2.5 max-[480px]:text-xs"
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
  const { categories, tips } = useApp()
  const [showAllCats, setShowAllCats] = useState(false)
  const isAll = !activeCat && !activeStarred && !activeTag && !untagged && !uncategorized

  const visibleCategories = useMemo(() => {
    if (showAllCats || categories.length <= CAT_PREVIEW) return categories
    const preview = categories.slice(0, CAT_PREVIEW)
    if (activeCat && activeCat !== "__none__" && !preview.some((cat) => cat.id === activeCat)) {
      const active = categories.find((cat) => cat.id === activeCat)
      if (active) preview.push(active)
    }
    return preview
  }, [showAllCats, categories, activeCat])

  const tipsByCategory = useMemo(() => {
    const counts = new Map()
    for (const tip of tips) {
      if (tip.deletedAt || !tip.categoryId) continue
      counts.set(tip.categoryId, (counts.get(tip.categoryId) || 0) + 1)
    }
    return counts
  }, [tips])

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
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${chipBase} ${activeCat === cat.id ? chipActive : chipIdle}`}
              style={activeCat === cat.id ? { background: cat.color + "2E", borderColor: cat.color } : undefined}
              onClick={() => onCatChange(cat.id)}
              aria-pressed={activeCat === cat.id}
            >
              {cat.emoji} {cat.name}
              {tipsByCategory.get(cat.id) > 0 && (
                <span className="ml-0.5 text-[11px] tabular-nums opacity-60">
                  {tipsByCategory.get(cat.id)}
                </span>
              )}
            </button>
          ))}
          {categories.length > CAT_PREVIEW && (
            <button
              type="button"
              className={chipMore}
              aria-expanded={showAllCats}
              onClick={() => setShowAllCats((v) => !v)}
            >
              {showAllCats ? "收起分类" : `更多分类 +${categories.length - CAT_PREVIEW}`}
            </button>
          )}
        </div>
      </div>

      <Select
        ariaLabel="排序方式"
        className="shrink-0 max-md:w-full"
        triggerClassName="cursor-pointer rounded-sketch border-2 border-line bg-card py-1 pl-3.5 pr-3 text-[13px] text-ink-soft transition-colors duration-200 hover:border-primary hover:text-ink max-[480px]:py-0.5 max-[480px]:pl-2.5 max-[480px]:text-xs"
        value={sort}
        onChange={onSortChange}
        options={[
          { value: "newest", label: "最新" },
          { value: "updated", label: "最近更新" },
          { value: "most", label: "最常用" },
          { value: "oldest", label: "最早" },
          { value: "title", label: "标题 A-Z" },
        ]}
      />
    </div>
  )
}
