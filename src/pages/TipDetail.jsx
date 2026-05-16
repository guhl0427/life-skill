import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import ConfirmDialog from "../components/ConfirmDialog"

function formatDate(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return y + "/" + m + "/" + day
}

export default function TipDetail() {
  const { id } = useParams()
  const { getTip, categories, tags, deleteTip } = useApp()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  const tip = getTip(id)

  if (!tip) {
    return (
      <div className="empty-state">
        <div className="icon">😅</div>
        <h3>技巧不存在</h3>
        <p>这个技巧可能已被删除</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          返回首页
        </Link>
      </div>
    )
  }

  const cat = categories.find((c) => c.id === tip.categoryId)
  const tipTags = tags.filter((t) => tip.tagIds?.includes(t.id))

  const handleDelete = () => {
    deleteTip(id)
    navigate("/")
  }

  return (
    <div className="detail-page">
      <Link to="/" className="detail-back">← 返回首页</Link>

      <div className="detail-header">
        <div className="detail-meta">
          {cat && (
            <span
              className="tip-card-category"
              style={{ background: cat.color + "18", color: cat.color, fontSize: 13 }}
            >
              {cat.emoji} {cat.name}
            </span>
          )}
          <span style={{ fontFamily: "var(--font-hand)", color: "var(--text-light)", fontSize: 14 }}>
            {formatDate(tip.createdAt)}
          </span>
        </div>
        <h1 className="detail-title">{tip.title}</h1>
      </div>

      <div className="detail-content">{tip.content}</div>

      {tipTags.length > 0 && (
        <div className="detail-tags">
          {tipTags.map((t) => (
            <span key={t.id} className="tag">{t.name}</span>
          ))}
        </div>
      )}

      <div className="detail-actions">
        <Link to={"/tips/" + id + "/edit"} className="btn btn-primary">
          编辑
        </Link>
        <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
          删除
        </button>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="删除技巧"
          message="确定要删除这个技巧吗？删除后无法恢复。"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}
