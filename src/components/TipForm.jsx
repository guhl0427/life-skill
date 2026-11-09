import { useState } from "react"
import { useApp } from "../context/useApp"
import { btnPrimary, btnOutline, btnSm, field, label } from "./ui"

const quickAction = "mb-2 shrink-0 text-[13px] text-primary hover:underline"

export default function TipForm({ initial, onSubmit, onCancel }) {
  const { categories, tags, addCategory, addTag } = useApp()
  const [title, setTitle] = useState(initial?.title || "")
  const [content, setContent] = useState(initial?.content || "")
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "")
  const [tagIds, setTagIds] = useState(initial?.tagIds || [])
  const [steps, setSteps] = useState(initial?.steps || [])
  const [error, setError] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  const toggleTag = (id) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const hasSameName = (list, value) =>
    list.some((item) => item.name.trim().toLowerCase() === value.toLowerCase())

  const handleAddCategory = () => {
    const trimmed = newCatName.trim()
    if (!trimmed) { setError("请输入分类名称"); return }
    if (hasSameName(categories, trimmed)) { setError("已有同名分类"); return }
    setError("")
    const created = addCategory({ name: trimmed, emoji: "📌", color: "#7EB8A0" })
    setCategoryId(created.id)
    setNewCatName("")
    setShowNewCat(false)
  }

  const handleAddTag = () => {
    const trimmed = newTagName.trim()
    if (!trimmed) { setError("请输入标签名称"); return }
    if (hasSameName(tags, trimmed)) { setError("已有同名标签"); return }
    setError("")
    const created = addTag({ name: trimmed })
    setTagIds((prev) => [...prev, created.id])
    setNewTagName("")
    setShowNewTag(false)
  }

  const updateStep = (index, value) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)))
  }

  const removeStep = (index) => {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) { setError("请输入标题"); return }
    if (!content.trim()) { setError("请输入内容"); return }
    setError("")
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      tagIds,
      steps: steps.map((s) => s.trim()).filter(Boolean),
    })
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
        <div className="flex items-center justify-between gap-3">
          <span className={label}>步骤（可选）</span>
          <button
            type="button"
            className={quickAction}
            onClick={() => setSteps((prev) => [...prev, ""])}
          >
            + 添加步骤
          </button>
        </div>
        {steps.length === 0 ? (
          <p className="text-xs text-ink-faint">把做法拆成步骤，查看时会更清晰</p>
        ) : (
          <div className="flex flex-col gap-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center font-hand text-sm text-ink-faint">
                  {index + 1}.
                </span>
                <input
                  className={`${field} py-1.5 text-sm`}
                  aria-label={`步骤 ${index + 1}`}
                  maxLength={200}
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                />
                <button
                  type="button"
                  className="shrink-0 px-1 text-ink-faint transition-colors hover:text-danger"
                  aria-label={`删除步骤 ${index + 1}`}
                  onClick={() => removeStep(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <label className={label} htmlFor="tip-category">分类</label>
          <button
            type="button"
            className={quickAction}
            onClick={() => { setShowNewCat((v) => !v); setError("") }}
          >
            + 新建分类
          </button>
        </div>
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
        {showNewCat && (
          <div className="mt-2 flex gap-2">
            <input
              className={`${field} py-1.5 text-sm`}
              aria-label="新分类名称"
              placeholder="分类名称"
              maxLength={12}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory() } }}
            />
            <button type="button" className={`${btnPrimary} ${btnSm} shrink-0`} onClick={handleAddCategory}>
              添加
            </button>
          </div>
        )}
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <span className={label}>标签（可多选）</span>
          <button
            type="button"
            className={quickAction}
            onClick={() => { setShowNewTag((v) => !v); setError("") }}
          >
            + 新建标签
          </button>
        </div>
        {showNewTag && (
          <div className="mb-2 flex gap-2">
            <input
              className={`${field} py-1.5 text-sm`}
              aria-label="新标签名称"
              placeholder="标签名称"
              maxLength={12}
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag() } }}
            />
            <button type="button" className={`${btnPrimary} ${btnSm} shrink-0`} onClick={handleAddTag}>
              添加
            </button>
          </div>
        )}
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
