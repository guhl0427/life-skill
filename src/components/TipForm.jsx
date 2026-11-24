import { useEffect, useState } from "react"
import { useApp } from "../context/useApp"
import { btnPrimary, btnOutline, btnSm, field, label } from "./ui"
import Select from "./Select"

const quickAction = "mb-2 shrink-0 text-[13px] text-primary hover:underline"

const DRAFT_PREFIX = "ls_draft:"
const emptyDraft = {
  title: "",
  content: "",
  scenario: "",
  duration: "",
  difficulty: "",
  materials: [],
  notes: "",
  categoryId: "",
  tagIds: [],
  steps: [],
}

function readDraft(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== "object") return null
    return {
      title: typeof data.title === "string" ? data.title : "",
      content: typeof data.content === "string" ? data.content : "",
      scenario: typeof data.scenario === "string" ? data.scenario : "",
      duration: typeof data.duration === "string" ? data.duration : "",
      difficulty: ["简单", "适中", "较难"].includes(data.difficulty) ? data.difficulty : "",
      materials: Array.isArray(data.materials) ? data.materials.filter((m) => typeof m === "string") : [],
      notes: typeof data.notes === "string" ? data.notes : "",
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
    scenario: (draft.scenario || "").trim(),
    duration: (draft.duration || "").trim(),
    difficulty: draft.difficulty || "",
    materials: (draft.materials || []).map((m) => m.trim()).filter(Boolean),
    notes: (draft.notes || "").trim(),
    categoryId: draft.categoryId || "",
    tagIds: [...(draft.tagIds || [])].sort(),
    steps: (draft.steps || []).map((step) => step.trim()).filter(Boolean),
  }
}

function isSameDraft(a, b) {
  const left = normalizeDraft(a)
  const right = normalizeDraft(b)
  const sameList = (x, y) => x.length === y.length && x.every((item, index) => item === y[index])
  return (
    left.title === right.title &&
    left.content === right.content &&
    left.scenario === right.scenario &&
    left.duration === right.duration &&
    left.difficulty === right.difficulty &&
    left.notes === right.notes &&
    left.categoryId === right.categoryId &&
    sameList(left.materials, right.materials) &&
    sameList(left.tagIds, right.tagIds) &&
    sameList(left.steps, right.steps)
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
  const [scenario, setScenario] = useState(savedDraft?.scenario ?? initial?.scenario ?? "")
  const [duration, setDuration] = useState(savedDraft?.duration ?? initial?.duration ?? "")
  const [difficulty, setDifficulty] = useState(savedDraft?.difficulty ?? initial?.difficulty ?? "")
  const [materials, setMaterials] = useState(savedDraft?.materials ?? initial?.materials ?? [])
  const [notes, setNotes] = useState(savedDraft?.notes ?? initial?.notes ?? "")
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
  const [catError, setCatError] = useState("")
  const [tagError, setTagError] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")

  // 内容有改动时自动保存草稿，离开页面后再次进入可恢复
  useEffect(() => {
    const draft = {
      title, content, scenario, duration, difficulty, materials, notes, categoryId, tagIds, steps,
    }
    try {
      if (isSameDraft(draft, initial || emptyDraft)) sessionStorage.removeItem(draftKey)
      else sessionStorage.setItem(draftKey, JSON.stringify(draft))
    } catch {
      // 草稿存储不可用时忽略，不影响正常编辑
    }
  }, [title, content, scenario, duration, difficulty, materials, notes, categoryId, tagIds, steps, draftKey, initial])

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
    setScenario(base.scenario || "")
    setDuration(base.duration || "")
    setDifficulty(base.difficulty || "")
    setMaterials(base.materials || [])
    setNotes(base.notes || "")
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
    if (!trimmed) { setCatError("请输入分类名称"); return }
    if (hasSameName(categories, trimmed)) { setCatError("已有同名分类"); return }
    setCatError("")
    const created = addCategory({ name: trimmed, emoji: "📌", color: "#7EB8A0" })
    setCategoryId(created.id)
    setNewCatName("")
    setShowNewCat(false)
  }

  const handleAddTag = () => {
    const trimmed = newTagName.trim()
    if (!trimmed) { setTagError("请输入标签名称"); return }
    if (hasSameName(tags, trimmed)) { setTagError("已有同名标签"); return }
    setTagError("")
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

  const updateMaterial = (index, value) => {
    setMaterials((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const removeMaterial = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index))
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
      scenario: scenario.trim(),
      duration: duration.trim(),
      difficulty,
      materials: materials.map((m) => m.trim()).filter(Boolean),
      notes: notes.trim(),
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
        <div className="flex items-center justify-between gap-3">
          <label className={label} htmlFor="tip-title">标题</label>
          <span className="mb-2 text-xs tabular-nums text-ink-faint">{title.length}/60</span>
        </div>
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
        <div className="flex items-center justify-between gap-3">
          <label className={label} htmlFor="tip-content">内容</label>
          <span className="mb-2 text-xs tabular-nums text-ink-faint">{content.length}/2000</span>
        </div>
        <textarea
          id="tip-content"
          className={`${field} min-h-40 resize-y leading-relaxed`}
          maxLength={2000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <div>
          <label className={label} htmlFor="tip-scenario">适用场景</label>
          <input
            id="tip-scenario"
            className={field}
            type="text"
            maxLength={40}
            placeholder="如：厨房清洁"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </div>
        <div>
          <label className={label} htmlFor="tip-duration">耗时</label>
          <input
            id="tip-duration"
            className={field}
            type="text"
            maxLength={20}
            placeholder="如：10 分钟"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div>
          <span className={label}>难度</span>
          <Select
            ariaLabel="难度"
            className="w-full"
            triggerClassName={`${field} cursor-pointer`}
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: "", label: "未设置" },
              { value: "简单", label: "简单" },
              { value: "适中", label: "适中" },
              { value: "较难", label: "较难" },
            ]}
          />
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <span className={label}>材料</span>
          <button
            type="button"
            className={quickAction}
            onClick={() => setMaterials((prev) => [...prev, ""])}
          >
            + 添加材料
          </button>
        </div>
        {materials.length > 0 && (
          <div className="flex flex-col gap-2">
            {materials.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center font-hand text-sm text-ink-faint">·</span>
                <input
                  className={`${field} py-1.5 text-sm`}
                  aria-label={`材料 ${index + 1}`}
                  maxLength={40}
                  value={item}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                />
                <button
                  type="button"
                  className="shrink-0 px-1 text-ink-faint transition-colors hover:text-danger"
                  aria-label={`删除材料 ${index + 1}`}
                  onClick={() => removeMaterial(index)}
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
              <div key={index} className="flex items-start gap-2">
                <span className="w-6 shrink-0 pt-2 text-center font-hand text-sm text-ink-faint">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    className={`${field} py-1.5 text-sm`}
                    aria-label={`步骤 ${index + 1}`}
                    maxLength={200}
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                  />
                  {step.length >= 180 && (
                    <span className="mt-1 block text-right text-[11px] tabular-nums text-ink-faint">
                      {step.length}/200
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="shrink-0 px-1 pt-1.5 text-ink-faint transition-colors hover:text-danger"
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
          <label className={label} htmlFor="tip-notes">注意事项</label>
          <span className="mb-2 text-xs tabular-nums text-ink-faint">{notes.length}/300</span>
        </div>
        <textarea
          id="tip-notes"
          className={`${field} min-h-24 resize-y leading-relaxed`}
          maxLength={300}
          placeholder="可选，例如安全提醒、容易失败的环节"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <label className={label} htmlFor="tip-category">分类</label>
          <button
            type="button"
            className={quickAction}
            onClick={() => { setShowNewCat((v) => !v); setCatError("") }}
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
          <div className="mt-2">
            <div className="flex gap-2">
              <input
                className={`${field} py-1.5 text-sm`}
                aria-label="新分类名称"
                placeholder="分类名称"
                maxLength={12}
                value={newCatName}
                onChange={(e) => { setNewCatName(e.target.value); setCatError("") }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory() } }}
              />
              <button type="button" className={`${btnPrimary} ${btnSm} shrink-0`} onClick={handleAddCategory}>
                添加
              </button>
            </div>
            {catError && <p role="alert" className="mt-1.5 text-sm text-danger">{catError}</p>}
          </div>
        )}
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <span className={label}>标签</span>
          <button
            type="button"
            className={quickAction}
            onClick={() => { setShowNewTag((v) => !v); setTagError("") }}
          >
            + 新建标签
          </button>
        </div>
        {showNewTag && (
          <div className="mb-2">
            <div className="flex gap-2">
              <input
                className={`${field} py-1.5 text-sm`}
                aria-label="新标签名称"
                placeholder="标签名称"
                maxLength={12}
                value={newTagName}
                onChange={(e) => { setNewTagName(e.target.value); setTagError("") }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag() } }}
              />
              <button type="button" className={`${btnPrimary} ${btnSm} shrink-0`} onClick={handleAddTag}>
                添加
              </button>
            </div>
            {tagError && <p role="alert" className="mt-1.5 text-sm text-danger">{tagError}</p>}
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
