import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import { backLink, btnPrimary, btnOutline, btnDanger, btnSm, field, pageTitle } from "../components/ui"

const editInput =
  "min-w-0 flex-1 rounded-sketch border-2 border-line bg-card px-2.5 py-1.5 text-sm focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] focus:outline-none"

export default function Tags() {
  const { tags, tips, addTag, updateTag, deleteTag } = useApp()
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [error, setError] = useState("")

  const countByTag = useMemo(() => {
    const counts = new Map()
    for (const tip of tips) {
      for (const id of tip.tagIds || []) {
        counts.set(id, (counts.get(id) || 0) + 1)
      }
    }
    return counts
  }, [tips])

  const isDuplicate = (value, excludeId) =>
    tags.some(
      (t) => t.id !== excludeId && t.name.trim().toLowerCase() === value.trim().toLowerCase()
    )

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) { setError("请输入标签名称"); return }
    if (isDuplicate(trimmed)) { setError("已有同名标签"); return }
    setError("")
    addTag({ name: trimmed })
    setName("")
  }

  const startEdit = (tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setError("")
  }

  const handleUpdate = () => {
    const trimmed = editName.trim()
    if (!trimmed) { setError("请输入标签名称"); return }
    if (isDuplicate(trimmed, editingId)) { setError("已有同名标签"); return }
    setError("")
    updateTag(editingId, { name: trimmed })
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <Link to="/" className={backLink}>← 返回首页</Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={pageTitle}><span className="hand-underline">标签管理</span></h1>
      </div>

      <form
        className="mb-5 flex items-end gap-2.5 rounded-sketch border-2 border-dashed border-line bg-card p-4 max-md:flex-col max-md:items-stretch"
        onSubmit={(e) => { e.preventDefault(); handleAdd() }}
      >
        <div className="flex-1">
          <label className="sr-only" htmlFor="tag-name">标签名称</label>
          <input
            id="tag-name"
            className={field}
            placeholder="标签名称"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className={`${btnPrimary} ${btnSm} shrink-0`}>
          添加
        </button>
      </form>

      {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="mgmt-item group flex items-center gap-3 rounded-sketch border-2 border-line bg-card px-4 py-3 shadow-ink transition-all duration-200 hover:border-primary hover:shadow-ink-hover max-[480px]:p-2.5"
          >
            {editingId === tag.id ? (
              <>
                <input
                  className={editInput}
                  aria-label="标签名称"
                  value={editName}
                  maxLength={12}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                />
                <button className={`${btnPrimary} ${btnSm}`} onClick={handleUpdate}>保存</button>
                <button className={`${btnOutline} ${btnSm}`} onClick={() => { setEditingId(null); setError("") }}>取消</button>
              </>
            ) : (
              <>
                <span className="shrink-0 text-2xl">🏷️</span>
                <div className="flex-1">
                  <div className="font-display text-[15px]">{tag.name}</div>
                  <div className="font-hand text-[13px] text-ink-faint">{countByTag.get(tag.id) || 0} 个技巧</div>
                </div>
                <div className="flex gap-1.5 opacity-40 transition-opacity duration-200 group-hover:opacity-100 max-md:opacity-100">
                  <button className={`${btnOutline} ${btnSm}`} onClick={() => startEdit(tag)}>编辑</button>
                  <button className={`${btnDanger} ${btnSm}`} onClick={() => setDeleteId(tag.id)}>删除</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="删除标签"
          message="删除后该标签会从所有技巧中移除。确定删除吗？"
          onConfirm={() => { deleteTag(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
