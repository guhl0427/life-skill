import { useMemo, useState } from "react"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import Select from "../components/Select"
import { btnPrimary, btnOutline, btnDanger, btnSm, field, pageTitle } from "../components/ui"

const editInput =
  "min-w-0 flex-1 rounded-sketch border-2 border-line bg-card px-2.5 py-1.5 text-sm focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-light)] focus:outline-none"

export default function Tags() {
  const { tags, tips, addTag, updateTag, deleteTag, mergeTags } = useApp()
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState(null)
  const [error, setError] = useState("")
  const [mergeSourceId, setMergeSourceId] = useState(null)
  const [mergeTargetId, setMergeTargetId] = useState("")
  const [notice, setNotice] = useState("")

  const countByTag = useMemo(() => {
    const counts = new Map()
    for (const tip of tips) {
      if (tip.deletedAt) continue
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

  const mergeSource = tags.find((tag) => tag.id === mergeSourceId) || null
  const mergeTargets = mergeSource ? tags.filter((tag) => tag.id !== mergeSource.id) : []
  const mergeCount = mergeSource
    ? tips.filter((tip) => (tip.tagIds || []).includes(mergeSource.id)).length
    : 0

  const startMerge = (tag) => {
    setMergeSourceId(tag.id)
    setMergeTargetId("")
    setEditingId(null)
    setError("")
    setNotice("")
  }

  const cancelMerge = () => {
    setMergeSourceId(null)
    setMergeTargetId("")
  }

  const handleMerge = () => {
    const target = tags.find((tag) => tag.id === mergeTargetId)
    if (!mergeSource || !target) return
    mergeTags(mergeSource.id, target.id)
    setNotice(`已将「${mergeSource.name}」合并到「${target.name}」，共更新 ${mergeCount} 条技巧`)
    cancelMerge()
  }

  const startEdit = (tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setError("")
    setMergeSourceId(null)
    setMergeTargetId("")
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
    <div>
      <h1 className={`${pageTitle} mb-6`}><span className="hand-underline">标签管理</span></h1>

      <div className="mx-auto max-w-[640px]">
        <form
          className="mb-5 flex items-end gap-2.5 rounded-sketch border-2 border-line bg-card p-4 max-md:flex-col max-md:items-stretch"
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

        {notice && (
          <div
            role="status"
            className="mb-3 rounded-sketch border-2 border-primary bg-primary-light px-4 py-2.5 text-sm text-ink"
          >
            {notice}
          </div>
        )}

        {mergeSource && (
          <div className="mb-4 rounded-sketch border-2 border-primary bg-card p-4">
            <div className="mb-1 font-display text-[15px] text-ink">
              合并标签「{mergeSource.name}」
            </div>
            <p className="mb-3 text-[13px] leading-relaxed text-ink-soft">
              该标签关联 {mergeCount} 条技巧（含回收站），合并后会替换为目标标签，原标签将被删除。
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Select
                ariaLabel="合并目标标签"
                className="min-w-[160px] flex-1"
                triggerClassName={`${field} cursor-pointer`}
                value={mergeTargetId}
                onChange={setMergeTargetId}
                options={[
                  { value: "", label: "选择目标标签" },
                  ...mergeTargets.map((tag) => ({ value: tag.id, label: tag.name })),
                ]}
              />
              <button
                type="button"
                className={`${btnPrimary} ${btnSm} disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={!mergeTargetId}
                onClick={handleMerge}
              >
                确认合并
              </button>
              <button type="button" className={`${btnOutline} ${btnSm}`} onClick={cancelMerge}>
                取消
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="mgmt-item group flex items-center gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-3 shadow-ink transition-all duration-200 hover:border-primary hover:shadow-ink-hover max-[480px]:p-2.5"
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
                    <div className="text-[13px] tabular-nums text-ink-faint">{countByTag.get(tag.id) || 0} 个技巧</div>
                  </div>
                  <div className="flex gap-1.5 opacity-40 transition-opacity duration-200 group-hover:opacity-100 max-md:opacity-100">
                    <button className={`${btnOutline} ${btnSm}`} onClick={() => startEdit(tag)}>编辑</button>
                    <button
                      className={`${btnOutline} ${btnSm} disabled:cursor-not-allowed disabled:opacity-40`}
                      aria-label={"合并标签 " + tag.name}
                      title={tags.length < 2 ? "至少需要两个标签才能合并" : undefined}
                      disabled={tags.length < 2}
                      onClick={() => startMerge(tag)}
                    >
                      合并
                    </button>
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
            onConfirm={() => {
              if (deleteId === mergeSourceId) cancelMerge()
              deleteTag(deleteId)
              setDeleteId(null)
            }}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </div>
    </div>
  )
}
