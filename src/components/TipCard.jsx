import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"

function formatDate(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return y + "/" + m + "/" + day
}

function highlightText(text, query) {
  if (!query || !text) return text
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const parts = []
  let last = 0
  let idx = lower.indexOf(q)
  while (idx !== -1) {
    if (idx > last) parts.push(text.slice(last, idx))
    parts.push(<mark key={idx} className="search-highlight">{text.slice(idx, idx + q.length)}</mark>)
    last = idx + q.length
    idx = lower.indexOf(q, last)
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length > 0 ? parts : text
}

export default function TipCard({ tip, search, showActions, onDelete }) {
  const { categories, tags, toggleStar } = useApp()
  const cat = categories.find((c) => c.id === tip.categoryId)
  const tipTags = tags.filter((t) => tip.tagIds?.includes(t.id))

  const handleStar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleStar(tip.id)
  }

  return (
    <div className={"tip-card" + (tip.starred ? " starred" : "")}>
      <div className="tip-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <button className="star-btn" onClick={handleStar}>
            {tip.starred ? "⭐" : "☆"}
          </button>
          {cat && (
            <span
              className="tip-card-category"
              style={{ background: cat.color + "18", color: cat.color }}
            >
              {cat.emoji} {cat.name}
            </span>
          )}
        </div>
        <span className="tip-card-date">{formatDate(tip.createdAt)}</span>
      </div>
      <Link to={"/tips/" + tip.id} style={{ textDecoration: "none", color: "inherit" }}>
        <h3 className="tip-card-title">{search ? highlightText(tip.title, search) : tip.title}</h3>
        <p className="tip-card-excerpt">{search ? highlightText(tip.content, search) : tip.content}</p>
      </Link>
      {tipTags.length > 0 && (
        <div className="tip-card-tags">
          {tipTags.map((t) => (
            <span key={t.id} className="tag">{t.name}</span>
          ))}
        </div>
      )}
      {showActions && (
        <div className="tip-card-footer">
          <Link to={"/tips/" + tip.id + "/edit"} className="btn btn-outline btn-sm">
            编辑
          </Link>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(tip.id)}>
            删除
          </button>
        </div>
      )}
    </div>
  )
}
