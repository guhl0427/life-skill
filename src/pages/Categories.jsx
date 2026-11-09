import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import { backLink, btnPrimary, btnOutline, btnDanger, btnSm, field, pageTitle } from "../components/ui"

const colorOptions = ["#7EB8A0","#F4A261","#E8A87C","#A8D5BA","#C9B8E0","#F7C6C6","#B8D4E3","#D4C9B8"]

const editInput =
  "min-w-0 flex-1 rounded-sketch border-2 border-line bg-card px-2.5 py-1.5 text-sm focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] focus:outline-none"

function ColorSwatches({ value, small, onPick }) {
  return (
    <div className="flex shrink-0 items-center gap-1 max-md:justify-start">
      {colorOptions.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={"选择颜色 " + c}
          aria-pressed={value === c}
          className={
            "cursor-pointer rounded-md border-2 " +
            (small ? "h-[18px] w-[18px]" : "h-6 w-6")
          }
          style={{
            background: c,
            borderColor: value === c ? "var(--ink)" : "transparent",
          }}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  )
}

export default function Categories() {
  const { categories, tips, addCategory, updateCategory, deleteCategory } = useApp()
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("📌")
  const [color, setColor] = useState(colorOptions[0])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editColor, setEditColor] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [error, setError] = useState("")

  const countByCat = useMemo(() => {
    const counts = new Map()
    for (const tip of tips) {
      if (tip.categoryId) counts.set(tip.categoryId, (counts.get(tip.categoryId) || 0) + 1)
    }
    return counts
  }, [tips])

  const isDuplicate = (value, excludeId) =>
    categories.some(
      (c) => c.id !== excludeId && c.name.trim().toLowerCase() === value.trim().toLowerCase()
    )

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) { setError("请输入分类名称"); return }
    if (isDuplicate(trimmed)) { setError("已有同名分类"); return }
    setError("")
    addCategory({ name: trimmed, emoji: emoji.trim() || "📌", color })
    setName("")
    setEmoji("📌")
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditEmoji(cat.emoji)
    setEditColor(cat.color)
    setError("")
  }

  const handleUpdate = () => {
    const trimmed = editName.trim()
    if (!trimmed) { setError("请输入分类名称"); return }
    if (isDuplicate(trimmed, editingId)) { setError("已有同名分类"); return }
    setError("")
    updateCategory(editingId, {
      name: trimmed,
      emoji: editEmoji.trim() || "📌",
      color: editColor,
    })
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <Link to="/" className={backLink}>← 返回首页</Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={pageTitle}><span className="hand-underline">分类管理</span></h1>
      </div>

      <form
        className="mb-5 flex items-end gap-2.5 rounded-sketch border-2 border-dashed border-line bg-card p-4 max-md:flex-col max-md:items-stretch"
        onSubmit={(e) => { e.preventDefault(); handleAdd() }}
      >
        <div className="flex-1">
          <label className="sr-only" htmlFor="cat-name">分类名称</label>
          <input
            id="cat-name"
            className={field}
            placeholder="分类名称"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <input
          className="w-14 shrink-0 rounded-sketch border-2 border-line bg-card px-0 py-2 text-center text-[15px] focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] focus:outline-none"
          aria-label="分类图标"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📌"
        />
        <ColorSwatches value={color} onPick={setColor} />
        <button type="submit" className={`${btnPrimary} ${btnSm} shrink-0`}>
          添加
        </button>
      </form>

      {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="mgmt-item group flex items-center gap-3 rounded-sketch border-2 border-line bg-card px-4 py-3 shadow-ink transition-all duration-200 hover:border-primary hover:shadow-ink-hover max-[480px]:p-2.5"
          >
            {editingId === cat.id ? (
              <>
                <input
                  className={editInput}
                  aria-label="分类名称"
                  value={editName}
                  maxLength={12}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                />
                <input
                  className="w-11 shrink-0 rounded-sketch border-2 border-line bg-card px-0 py-1.5 text-center text-sm focus:border-primary focus:outline-none"
                  aria-label="分类图标"
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                />
                <ColorSwatches value={editColor} small onPick={setEditColor} />
                <button className={`${btnPrimary} ${btnSm}`} onClick={handleUpdate}>保存</button>
                <button className={`${btnOutline} ${btnSm}`} onClick={() => { setEditingId(null); setError("") }}>取消</button>
              </>
            ) : (
              <>
                <div
                  className="h-8 w-8 shrink-0 rounded-lg border-2 border-line"
                  style={{ background: cat.color }}
                />
                <span className="shrink-0 text-2xl">{cat.emoji}</span>
                <div className="flex-1">
                  <div className="font-display text-[15px]">{cat.name}</div>
                  <div className="font-hand text-[13px] text-ink-faint">{countByCat.get(cat.id) || 0} 个技巧</div>
                </div>
                <div className="flex gap-1.5 opacity-40 transition-opacity duration-200 group-hover:opacity-100 max-md:opacity-100">
                  <button className={`${btnOutline} ${btnSm}`} onClick={() => startEdit(cat)}>编辑</button>
                  <button className={`${btnDanger} ${btnSm}`} onClick={() => setDeleteId(cat.id)}>删除</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="删除分类"
          message="删除后该分类下的技巧将变为未分类。确定删除吗？"
          onConfirm={() => { deleteCategory(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
