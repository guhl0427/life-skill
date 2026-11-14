import { useMemo, useState } from "react"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import { btnPrimary, btnOutline, btnDanger, btnSm, field, label, pageTitle } from "../components/ui"

const colorOptions = ["#7EB8A0","#F4A261","#E8A87C","#A8D5BA","#C9B8E0","#F7C6C6","#B8D4E3","#D4C9B8"]

const emojiOptions = ["📌","🧹","📦","🍳","💡","🌿","🧺","🎨","📚","💰"]

const hexPattern = /^#[0-9a-f]{6}$/i

const miniInput =
  "rounded-sketch border-2 border-line bg-card text-center focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] focus:outline-none"

function EmojiControl({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {emojiOptions.map((e) => (
        <button
          key={e}
          type="button"
          aria-label={"选择图标 " + e}
          aria-pressed={value === e}
          className={
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-sketch-sm border-2 text-lg leading-none transition-all duration-200 " +
            (value === e
              ? "border-ink bg-primary-light"
              : "border-transparent hover:border-line hover:bg-paper-deep")
          }
          onClick={() => onChange(e)}
        >
          {e}
        </button>
      ))}
      <input
        className={`${miniInput} w-20 px-1 py-1.5 text-base`}
        aria-label="自定义图标"
        title="也可以直接输入 emoji"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="自定义"
      />
    </div>
  )
}

function ColorControl({ value, onPick }) {
  const trimmed = value.trim()
  const pickerValue = hexPattern.test(trimmed) ? trimmed : colorOptions[0]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {colorOptions.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={"选择颜色 " + c}
          aria-pressed={value === c}
          className="h-6 w-6 shrink-0 cursor-pointer rounded-md border-2 transition-transform duration-150 hover:scale-110"
          style={{
            background: c,
            borderColor: value === c ? "var(--ink)" : "transparent",
          }}
          onClick={() => onPick(c)}
        />
      ))}
      <span className="mx-0.5 h-5 w-px bg-line" aria-hidden="true" />
      <label
        className="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-line bg-card text-sm transition-colors duration-200 hover:border-primary"
        title="调色盘"
      >
        <span aria-hidden="true">🎨</span>
        <input
          type="color"
          aria-label="打开调色盘选择颜色"
          value={pickerValue}
          onChange={(e) => onPick(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        className={`${miniInput} w-24 px-2 py-1.5 text-left text-sm uppercase`}
        aria-label="输入颜色色值"
        title="输入十六进制色值，如 #7EB8A0"
        value={value}
        spellCheck={false}
        placeholder="#7EB8A0"
        onChange={(e) => onPick(e.target.value)}
      />
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
      if (tip.deletedAt) continue
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
    addCategory({ name: trimmed, emoji: emoji.trim() || "📌", color: color.trim() || colorOptions[0] })
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
      color: editColor.trim() || colorOptions[0],
    })
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className={pageTitle}><span className="hand-underline">分类管理</span></h1>
      </div>

      <form
        className="mb-5 flex flex-col gap-3 rounded-sketch border-2 border-dashed border-line bg-card p-4"
        onSubmit={(e) => { e.preventDefault(); handleAdd() }}
      >
        <div>
          <label htmlFor="cat-name" className={label}>分类名称</label>
          <input
            id="cat-name"
            className={field}
            placeholder="例如：清洁妙招"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <div className={label}>图标</div>
          <EmojiControl value={emoji} onChange={setEmoji} />
        </div>
        <div>
          <div className={label}>颜色</div>
          <ColorControl value={color} onPick={setColor} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className={`${btnPrimary} ${btnSm}`}>
            添加分类
          </button>
        </div>
      </form>

      {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="mgmt-item group flex items-center gap-3 rounded-sketch border-2 border-line bg-card px-4 py-3 shadow-ink transition-all duration-200 hover:border-primary hover:shadow-ink-hover max-[480px]:p-2.5"
          >
            {editingId === cat.id ? (
              <div className="flex w-full flex-col gap-3">
                <input
                  className={field}
                  aria-label="分类名称"
                  value={editName}
                  maxLength={12}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                />
                <div>
                  <div className="mb-2 text-sm text-ink-soft">图标</div>
                  <EmojiControl value={editEmoji} onChange={setEditEmoji} />
                </div>
                <div>
                  <div className="mb-2 text-sm text-ink-soft">颜色</div>
                  <ColorControl value={editColor} onPick={setEditColor} />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className={`${btnPrimary} ${btnSm}`} onClick={handleUpdate}>保存</button>
                  <button type="button" className={`${btnOutline} ${btnSm}`} onClick={() => { setEditingId(null); setError("") }}>取消</button>
                </div>
              </div>
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
