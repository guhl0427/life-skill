import { useState } from "react"
import { useApp } from "../context/useApp"
import { btnPrimary, btnOutline, field, label } from "./ui"

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
    <form className="mx-auto max-w-[600px]" onSubmit={handleSubmit}>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-sketch border-2 border-accent bg-accent-light px-4 py-2.5 text-sm"
        >
          {error}
        </div>
      )}

      <div className="mb-5">
        <label className={label} htmlFor="tip-title">标题</label>
        <input
          id="tip-title"
          className={field}
          type="text"
          maxLength={60}
          placeholder="给这个技巧取个名字..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label className={label} htmlFor="tip-content">内容</label>
        <textarea
          id="tip-content"
          className={`${field} min-h-40 resize-y leading-relaxed`}
          maxLength={2000}
          placeholder="详细描述这个小妙招..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label className={label} htmlFor="tip-category">分类</label>
        <select
          id="tip-category"
          className={`${field} select-arrow cursor-pointer pr-9`}
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

      <div className="mb-5">
        <span className={label}>标签（可多选）</span>
        <div className="flex flex-wrap gap-2 py-2">
          {tags.map((tag) => {
            const selected = tagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                className={
                  "rounded-sketch border-2 px-3.5 py-1.5 text-[13px] transition-all duration-200 " +
                  (selected
                    ? "border-primary-hover bg-primary text-white shadow-[1px_2px_0_var(--line)]"
                    : "border-line-soft bg-card text-ink-soft hover:border-primary hover:text-primary")
                }
                onClick={() => toggleTag(tag.id)}
                aria-pressed={selected}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-7 flex justify-end gap-3 border-t-2 border-dashed border-line-soft pt-5 max-md:flex-col-reverse">
        <button type="button" className={`${btnOutline} max-md:w-full`} onClick={onCancel}>
          取消
        </button>
        <button type="submit" className={`${btnPrimary} max-md:w-full`}>
          保存
        </button>
      </div>
    </form>
  )
}
