import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function TipForm({ initial, onSubmit, onCancel }) {
  const { categories, tags } = useApp()
  const [title, setTitle] = useState(initial?.title || "")
  const [content, setContent] = useState(initial?.content || "")
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "")
  const [tagIds, setTagIds] = useState(initial?.tagIds || [])
  const [error, setError] = useState("")

  const toggleTag = (id) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) { setError("请输入标题"); return }
    if (!content.trim()) { setError("请输入内容"); return }
    setError("")
    onSubmit({ title: title.trim(), content: content.trim(), categoryId, tagIds })
  }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: "#FEF0E4", border: "2px solid var(--accent)", borderRadius: "12px", padding: "10px 16px", marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">标题</label>
        <input
          className="form-input"
          type="text"
          placeholder="给这个技巧取个名字..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">内容</label>
        <textarea
          className="form-textarea"
          placeholder="详细描述这个小妙招..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">分类</label>
        <select
          className="form-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">标签（可多选）</label>
        <div className="form-tags">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className={"form-tag" + (tagIds.includes(tag.id) ? " selected" : "")}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn btn-primary">
          保存
        </button>
      </div>
    </form>
  )
}
