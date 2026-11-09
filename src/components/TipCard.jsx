import { Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import { formatDate } from "../utils/format"
import { getSnippet, splitByKeywords } from "../utils/search"
import { btnOutline, btnDanger, btnSm } from "./ui"

function highlightText(text, query) {
  const parts = splitByKeywords(text, query)
  if (parts.length === 0) return text
  return parts.map((part, i) =>
    part.match
      ? <mark key={i} className="rounded-[3px] bg-accent/30 px-0.5 text-inherit">{part.text}</mark>
      : part.text
  )
}

export default function TipCard({ tip, search, showActions, onDelete, selectable, selected, onSelect }) {
  const { categoryMap, tagMap, toggleStar } = useApp()
  const cat = categoryMap.get(tip.categoryId)
  const tipTags = (tip.tagIds || []).map((id) => tagMap.get(id)).filter(Boolean)

  const handleStar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStar(tip.id)
  }

  return (
    <div
      className={
        "tip-card group relative flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-sketch-lg border-2 bg-card p-5 shadow-ink transition-[transform,box-shadow,border-color] duration-[250ms] ease-spring hover:shadow-ink-hover max-[480px]:p-3.5 " +
        (tip.starred ? "border-accent" : "border-line hover:border-primary") +
        (selected ? " border-primary shadow-ink-hover" : "")
      }
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {selectable && (
            <button
              type="button"
              className={
                "shrink-0 rounded border-2 px-1.5 py-0.5 text-xs leading-none transition-colors duration-200 " +
                (selected
                  ? "border-primary bg-primary text-white"
                  : "border-line text-ink-faint hover:border-primary")
              }
              aria-label={(selected ? "取消选择 " : "选择 ") + tip.title}
              aria-pressed={!!selected}
              onClick={() => onSelect?.(tip.id)}
            >
              {selected ? "✓" : "○"}
            </button>
          )}
          <button
            className="shrink-0 text-lg leading-none transition-transform duration-200 hover:scale-125"
            onClick={handleStar}
            aria-label={tip.starred ? "取消收藏" : "收藏"}
            aria-pressed={!!tip.starred}
          >
            {tip.starred ? "⭐" : "☆"}
          </button>
          {cat && (
            <span
              className="whitespace-nowrap rounded-sketch-sm px-2.5 py-0.5 text-xs"
              style={{ background: cat.color + "18", color: cat.color }}
            >
              {cat.emoji} {search ? highlightText(cat.name, search) : cat.name}
            </span>
          )}
        </div>
        <span className="whitespace-nowrap font-hand text-[13px] text-ink-faint">
          {formatDate(tip.createdAt)}
          {tip.updatedAt > tip.createdAt && (
            <span className="ml-1">· 已编辑</span>
          )}
          {tip.usageCount > 0 && (
            <span className="ml-1">· 用过 {tip.usageCount} 次</span>
          )}
        </span>
      </div>
      <Link to={"/tips/" + tip.id} className="text-inherit">
        <h3 className="line-clamp-2 font-display text-lg leading-snug text-ink max-[480px]:text-base">
          {search ? highlightText(tip.title, search) : tip.title}
        </h3>
        <p className="mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft max-md:text-[13px] max-md:line-clamp-2">
          {search ? highlightText(getSnippet(tip.content, search), search) : tip.content}
        </p>
      </Link>
      {tipTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {tipTags.map((t) => (
            <Link
              key={t.id}
              to={"/?tag=" + encodeURIComponent(t.id)}
              className="rounded-sketch-sm border border-line-soft bg-paper-deep px-2.5 py-0.5 font-hand text-xs text-ink-soft transition-colors duration-200 hover:border-primary hover:text-primary"
            >
              {search ? highlightText(t.name, search) : t.name}
            </Link>
          ))}
        </div>
      )}
      {showActions && (
        <div className="tip-card-footer mt-1 flex justify-end gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100">
          <Link to={"/tips/" + tip.id + "/edit"} className={`${btnOutline} ${btnSm}`}>
            编辑
          </Link>
          <button className={`${btnDanger} ${btnSm}`} onClick={() => onDelete?.(tip.id)}>
            删除
          </button>
        </div>
      )}
    </div>
  )
}
