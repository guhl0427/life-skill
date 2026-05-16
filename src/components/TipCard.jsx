import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"

function formatDate(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return y + "/" + m + "/" + day
}

export default function TipCard({ tip, showActions, onDelete }) {
  const { categories, tags } = useApp()
  const cat = categories.find((c) => c.id === tip.categoryId)
  const tipTags = tags.filter((t) => tip.tagIds?.includes(t.id))

  return (
    <div className="tip-card">
      <div className="tip-card-header">
        {cat && (
          <span
            className="tip-card-category"
            style={{ background: cat.color + "18", color: cat.color }}
          >
            {cat.emoji} {cat.name}
          </span>
        )}
        <span className="tip-card-date">{formatDate(tip.createdAt)}</span>
      </div>
      <Link to={"/tips/" + tip.id} style={{ textDecoration: "none", color: "inherit" }}>
        <h3 className="tip-card-title">{tip.title}</h3>
        <p className="tip-card-excerpt">{tip.content}</p>
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
