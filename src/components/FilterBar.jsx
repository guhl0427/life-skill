import { useEffect, useMemo, useRef, useState } from "react"
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
  search,
  onClearSearch,
  onClearTag,
  onTagChange,
  onClearExtra,
  onReset,
  sort,
  onSortChange,
}) {
  const { categories, tags, tips } = useApp()
  const [showAllCats, setShowAllCats] = useState(false)
  const [stuck, setStuck] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const barRef = useRef(null)
  const tagButtonRef = useRef(null)
  const tagPanelRef = useRef(null)
  const isAll = !activeCat && !activeStarred && !activeTag && !untagged && !uncategorized && !search

  // 吸附到顶部时切换为单行 + 横向滚动
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let offset = 0
    const measure = () => {
      offset = parseFloat(getComputedStyle(bar).top) || 0
    }
    const update = () => {
      setStuck(bar.getBoundingClientRect().top <= offset + 0.5)
    }
    const onResize = () => {
      measure()
      update()
    }
    measure()
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", onResize)
    }
  }, [])

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

  const tipsByTag = useMemo(() => {
    const counts = new Map()
    for (const tip of tips) {
      if (tip.deletedAt) continue
      for (const id of tip.tagIds || []) {
        counts.set(id, (counts.get(id) || 0) + 1)
      }
    }
    return counts
  }, [tips])

  useEffect(() => {
    if (!tagOpen) return
    const onPointerDown = (e) => {
      if (tagButtonRef.current?.contains(e.target) || tagPanelRef.current?.contains(e.target)) return
      setTagOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") setTagOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [tagOpen])

  return (
    <div
      ref={barRef}
      className={
        "sticky top-[var(--header-height)] z-[9] -mx-8 mb-6 flex flex-wrap items-center gap-3 border-b-2 px-8 py-2 transition-[border-color,box-shadow] duration-200 max-md:-mx-4 max-md:px-4 max-md:py-1.5 max-[480px]:-mx-3 max-[480px]:px-3 " +
        (stuck ? "max-md:flex-nowrap " : "") +
        (stuck
          ? "border-line-soft bg-paper shadow-[0_8px_12px_-10px_rgba(61,61,61,0.5)]"
          : "border-transparent")
      }
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className={
            "flex min-w-0 flex-wrap gap-2 " +
            (stuck ? "max-md:flex-nowrap max-md:overflow-x-auto max-md:scrollbar-none" : "")
          }
        >
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
          <button
            type="button"
            ref={tagButtonRef}
            className={`${chipBase} ${tagOpen ? chipActive : chipIdle}`}
            onClick={() => setTagOpen((v) => !v)}
            aria-expanded={tagOpen}
          >
            🏷️ 标签
          </button>
          {search && (
            <button
              type="button"
              className={chipExtra}
              onClick={onClearSearch}
              aria-label={`清除搜索：${search}`}
            >
              <span className="max-w-[160px] truncate">搜索「{search}」</span>
              <span aria-hidden="true" className="text-[11px]">✕</span>
            </button>
          )}
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
              onClick={() => onCatChange(activeCat === cat.id ? "" : cat.id)}
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
        className={"shrink-0 " + (stuck ? "" : "max-md:w-full")}
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

      {tagOpen && (
        <div
          ref={tagPanelRef}
          className="absolute left-0 right-0 top-full z-30 mt-1 rounded-sketch border-2 border-line bg-card p-3 shadow-ink-hover"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs tracking-wider text-ink-faint">按标签筛选</span>
            <button
              type="button"
              aria-label="关闭标签筛选"
              className="text-sm text-ink-faint transition-colors hover:text-ink"
              onClick={() => setTagOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="flex max-h-[45vh] flex-wrap gap-2 overflow-y-auto">
            {tags.map((tag) => {
              const active = activeTag === tag.id
              const count = tipsByTag.get(tag.id) || 0
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`${chipBase} ${active ? chipActive : chipIdle}`}
                  onClick={() => {
                    onTagChange?.(active ? "" : tag.id)
                    setTagOpen(false)
                  }}
                  aria-pressed={active}
                >
                  #{tag.name}
                  {count > 0 && (
                    <span className="ml-0.5 text-[11px] tabular-nums opacity-60">{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
