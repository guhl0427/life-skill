import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useApp } from "../context/useApp"
import { formatDate } from "../utils/format"
import { getSnippet, splitByKeywords } from "../utils/search"

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
  const { categoryMap, tagMap, toggleStar, togglePin } = useApp()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const cat = categoryMap.get(tip.categoryId)
  const tipTags = (tip.tagIds || []).map((id) => tagMap.get(id)).filter(Boolean)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  const handleStar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStar(tip.id)
  }

  const handleCardClick = (e) => {
    if (e.target.closest("button, a")) return
    if (selectable) onSelect?.(tip.id)
    else navigate("/tips/" + tip.id)
  }

  const cardBody = (
    <>
      <h3 className="line-clamp-2 font-display text-[17px] leading-snug text-ink max-[480px]:text-base">
        {search ? highlightText(tip.title, search) : tip.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft max-md:text-[13px] max-md:line-clamp-2">
        {search ? highlightText(getSnippet(tip.content, search), search) : tip.content}
      </p>
    </>
  )

  return (
    <div
      onClick={handleCardClick}
      className={
        "tip-card group relative flex cursor-pointer flex-col gap-2.5 overflow-hidden rounded-sketch-lg border-[1.5px] bg-card p-5 shadow-ink transition-[transform,box-shadow,border-color] duration-200 ease-out hover:shadow-ink-hover max-[480px]:p-3.5 " +
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
                "shrink-0 rounded-sketch-sm border-2 px-1.5 py-0.5 text-xs leading-none transition-colors duration-200 " +
                (selected
                  ? "border-primary bg-primary text-on-primary"
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
              className="flex items-center gap-1 whitespace-nowrap rounded-sketch-sm border border-line-soft border-l-2 bg-paper-deep px-2.5 py-0.5 text-xs text-ink-soft"
              style={{ borderLeftColor: cat.color }}
            >
              {cat.emoji} {search ? highlightText(cat.name, search) : cat.name}
            </span>
          )}
          {tip.pinned && (
            <span className="shrink-0 text-sm leading-none" aria-label="已置顶" title="已置顶">
              📌
            </span>
          )}
        </div>
        <span className="whitespace-nowrap text-xs tabular-nums text-ink-faint">
          {formatDate(tip.createdAt)}
          {tip.duration && <span className="ml-1">· {tip.duration}</span>}
          {tip.usageCount > 0 && (
            <span className="ml-1">· 用过 {tip.usageCount} 次</span>
          )}
        </span>
      </div>
      {selectable ? (
        <div className="text-inherit">{cardBody}</div>
      ) : (
        <Link to={"/tips/" + tip.id} className="text-inherit">
          {cardBody}
        </Link>
      )}
      {tipTags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1">
          {tipTags.map((t) =>
            selectable ? (
              <span key={t.id} className="text-xs text-ink-faint">
                #{search ? highlightText(t.name, search) : t.name}
              </span>
            ) : (
              <Link
                key={t.id}
                to={"/?tag=" + encodeURIComponent(t.id)}
                className="text-xs text-ink-faint transition-colors duration-200 hover:text-primary"
              >
                #{search ? highlightText(t.name, search) : t.name}
              </Link>
            )
          )}
        </div>
      )}
      {showActions && (
        <div className="mt-1 flex justify-end">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="更多操作"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-sketch-sm border-2 border-line bg-card text-base leading-none text-ink-faint transition-colors duration-200 hover:border-primary hover:text-ink"
            >
              ⋯
            </button>
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full right-0 z-20 mb-1 flex w-24 flex-col overflow-hidden rounded-sketch border-2 border-line bg-card p-1 shadow-ink-hover"
              >
                <button
                  type="button"
                  className="rounded-sketch-sm px-2.5 py-1.5 text-left text-sm text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-ink"
                  onClick={() => {
                    setMenuOpen(false)
                    togglePin(tip.id)
                  }}
                >
                  {tip.pinned ? "取消置顶" : "置顶"}
                </button>
                <Link
                  to={"/tips/" + tip.id + "/edit"}
                  className="rounded-sketch-sm px-2.5 py-1.5 text-left text-sm text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-ink"
                >
                  编辑
                </Link>
                <button
                  type="button"
                  className="rounded-sketch-sm px-2.5 py-1.5 text-left text-sm text-danger transition-colors duration-200 hover:bg-accent-light"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete?.(tip.id)
                  }}
                >
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
