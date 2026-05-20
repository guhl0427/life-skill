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

function formatDateFull(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const h = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return y + "/" + m + "/" + day + " " + h + ":" + min
}

export default function TipDetail() {
  const { id } = useParams()
  const { getTip, categories, tags, toggleStar, deleteTip } = useApp()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  const [copied, setCopied] = useState(false)
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

  const handleCopy = async () => {
    const parts = []
    if (cat) parts.push("[" + cat.emoji + " " + cat.name + "]")
    parts.push(tip.title)
    parts.push("")
    parts.push(tip.content)
    if (tipTags.length > 0) {
      parts.push("")
      parts.push("标签: " + tipTags.map((t) => "#" + t.name).join(" "))
    }
    parts.push("")
    parts.push("来源: LifeSkill (" + formatDateFull(tip.createdAt) + ")")
    try {
      await navigator.clipboard.writeText(parts.join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent fail */ }
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
          <button className="star-btn-detail" onClick={() => toggleStar(id)}>
            {tip.starred ? "⭐" : "☆"}
          </button>
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
        <button className="btn btn-outline" onClick={handleCopy}>
          {copied ? "✅ 已复制" : "📋 复制"}
        </button>
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
