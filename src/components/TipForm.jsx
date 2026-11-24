import { useEffect, useState } from "react"
import { useApp } from "../context/useApp"
import { btnPrimary, btnOutline, btnSm, field, label } from "./ui"
import Select from "./Select"

const quickAction = "mb-2 shrink-0 text-[13px] text-primary hover:underline"

const DRAFT_PREFIX = "ls_draft:"
const emptyDraft = { title: "", content: "", categoryId: "", tagIds: [], steps: [] }

function readDraft(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== "object") return null
    return {
      title: typeof data.title === "string" ? data.title : "",
      content: typeof data.content === "string" ? data.content : "",
      categoryId: typeof data.categoryId === "string" ? data.categoryId : "",
      tagIds: Array.isArray(data.tagIds) ? data.tagIds.filter((id) => typeof id === "string") : [],
      steps: Array.isArray(data.steps) ? data.steps.filter((step) => typeof step === "string") : [],
    }
  } catch {
    return null
  }
}

function normalizeDraft(draft) {
  return {
    title: (draft.title || "").trim(),
    content: (draft.content || "").trim(),
    categoryId: draft.categoryId || "",
    tagIds: [...(draft.tagIds || [])].sort(),
    steps: (draft.steps || []).map((step) => step.trim()).filter(Boolean),
  }
}

function isSameDraft(a, b) {
  const left = normalizeDraft(a)
  const right = normalizeDraft(b)
  return (
    left.title === right.title &&
    left.content === right.content &&
    left.categoryId === right.categoryId &&
    left.tagIds.length === right.tagIds.length &&
    left.tagIds.every((id, index) => id === right.tagIds[index]) &&
    left.steps.length === right.steps.length &&
    left.steps.every((step, index) => step === right.steps[index])
  )
}

export default function TipForm({ initial, onSubmit, onCancel }) {
  const { categories, tags, addCategory, addTag } = useApp()
  const draftKey = DRAFT_PREFIX + (initial?.id || "new")
  const [savedDraft] = useState(() => {
    const draft = readDraft(draftKey)
    return draft && !isSameDraft(draft, initial || emptyDraft) ? draft : null
  })
  const [showDraftNotice, setShowDraftNotice] = useState(Boolean(savedDraft))
  const [title, setTitle] = useState(savedDraft?.title ?? initial?.title ?? "")
  const [content, setContent] = useState(savedDraft?.content ?? initial?.content ?? "")
  const [categoryId, setCategoryId] = useState(() => {
    const value = savedDraft?.categoryId ?? initial?.categoryId ?? ""
    return value && !categories.some((cat) => cat.id === value) ? "" : value
  })
  const [tagIds, setTagIds] = useState(() => {
    const value = savedDraft?.tagIds ?? initial?.tagIds ?? []
    return value.filter((id) => tags.some((tag) => tag.id === id))
  })
  const [steps, setSteps] = useState(savedDraft?.steps ?? initial?.steps ?? [])
  const [error, setError] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  // 内容有改动时自动保存草稿，离开页面后再次进入可恢复
  useEffect(() => {
    const draft = { title, content, categoryId, tagIds, steps }
    try {
      if (isSameDraft(draft, initial || emptyDraft)) sessionStorage.removeItem(draftKey)
      else sessionStorage.setItem(draftKey, JSON.stringify(draft))
    } catch {
      // 草稿存储不可用时忽略，不影响正常编辑
    }
  }, [title, content, categoryId, tagIds, steps, draftKey, initial])

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(draftKey)
    } catch {
      // 存储不可用时忽略
    }
  }

  const discardDraft = () => {
    const base = initial || emptyDraft
    setTitle(base.title || "")
    setContent(base.content || "")
    setCategoryId(base.categoryId || "")
    setTagIds(base.tagIds || [])
    setSteps(base.steps || [])
    setError("")
    setShowDraftNotice(false)
    clearDraft()
  }

  const handleCancel = () => {
    clearDraft()
    onCancel()
  }

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
    clearDraft()
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

      {showDraftNotice && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center gap-3 rounded-sketch border-2 border-line-soft bg-paper-deep px-4 py-2.5 text-sm text-ink-soft"
        >
          <span>已恢复上次未保存的草稿。</span>
          <button type="button" className="font-display text-primary hover:underline" onClick={discardDraft}>
            清除草稿
          </button>
        </div>
      )}

      <div className="mb-5">
        <label className={label} htmlFor="tip-title">标题</label>
        <input
          id="tip-title"
          className={field}
          type="text"
          maxLength={60}
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <span className={label}>步骤</span>
          <button
            type="button"
            className={quickAction}
            onClick={() => setSteps((prev) => [...prev, ""])}
          >
            + 添加步骤
          </button>
        </div>
        {steps.length > 0 && (
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
        <Select
          id="tip-category"
          className="w-full"
          triggerClassName={`${field} cursor-pointer`}
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { value: "", label: "选择分类" },
            ...categories.map((cat) => ({ value: cat.id, label: `${cat.emoji} ${cat.name}` })),
          ]}
        />
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
          <span className={label}>标签</span>
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
                    ? "border-primary-hover bg-primary text-on-primary shadow-[1px_2px_0_var(--line)]"
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
        <button type="button" className={`${btnOutline} max-md:w-full`} onClick={handleCancel}>
          取消
        </button>
        <button type="submit" className={`${btnPrimary} max-md:w-full`}>
          保存
        </button>
      </div>
    </form>
  )
}
