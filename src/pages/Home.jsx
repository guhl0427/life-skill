import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { useApp } from "../context/useApp"
import TipCard from "../components/TipCard"
import FilterBar from "../components/FilterBar"
import ConfirmDialog from "../components/ConfirmDialog"
import {
  buildBackup,
  parseBackup,
  mergeBackup,
  readSnapshot,
  saveSnapshot,
  SNAPSHOT_KEY,
} from "../utils/backup"
import { formatDate } from "../utils/format"
import { matchesTip } from "../utils/search"
import { btnOutline, btnDanger, btnSm, pageTitle, pageDesc } from "../components/ui"

export default function Home() {
  const { tips, categories, tags, categoryMap, tagMap, deleteTip, updateTip, restoreTip, importData } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCat = searchParams.get("cat") || ""
  const search = searchParams.get("q") || ""
  const activeStarred = searchParams.get("starred") === "1"
  const tagParam = searchParams.get("tag") || ""
  const activeTag = tagMap.has(tagParam) ? tagParam : ""
  const untaggedOnly = searchParams.get("untagged") === "1"
  const sortParam = searchParams.get("sort")
  const sort = ["newest", "oldest", "title", "updated", "most"].includes(sortParam) ? sortParam : "newest"
  const [deleteId, setDeleteId] = useState(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [pendingSource, setPendingSource] = useState("file")
  const [hasSnapshot, setHasSnapshot] = useState(() => Boolean(localStorage.getItem(SNAPSHOT_KEY)))
  const [notice, setNotice] = useState(() =>
    location.state?.deletedId ? "已移入回收站，可点击撤销" : ""
  )
  const [undoId, setUndoId] = useState(location.state?.deletedId || null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [batchCat, setBatchCat] = useState("")
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => { setNotice(""); setUndoId(null) }, 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const handleUndoDelete = () => {
    if (!undoId) return
    restoreTip(undoId)
    setUndoId(null)
    setNotice("已恢复技巧")
  }

  const filtered = useMemo(() => {
    let result = tips.filter((t) => !t.deletedAt)
    if (activeStarred) result = result.filter((t) => t.starred)
    if (activeCat === "__none__") result = result.filter((t) => !t.categoryId)
    else if (activeCat) result = result.filter((t) => t.categoryId === activeCat)
    if (activeTag) result = result.filter((t) => (t.tagIds || []).includes(activeTag))
    if (untaggedOnly) result = result.filter((t) => !(t.tagIds || []).length)
    if (search) {
      result = result.filter((t) => matchesTip(t, search, categoryMap, tagMap))
    }
    if (sort === "newest") result.sort((a, b) => b.createdAt - a.createdAt)
    else if (sort === "oldest") result.sort((a, b) => a.createdAt - b.createdAt)
    else if (sort === "updated") result.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
    else if (sort === "most") result.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0) || (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
    else if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title, "zh"))
    return result
  }, [tips, activeCat, activeTag, untaggedOnly, search, sort, activeStarred, categoryMap, tagMap])

  const handleRandom = useCallback(() => {
    const active = tips.filter((t) => !t.deletedAt)
    if (active.length === 0) return
    const i = Math.floor(Math.random() * active.length)
    navigate("/tips/" + active[i].id)
  }, [tips, navigate])

  const handleStarredChange = () => {
    const params = new URLSearchParams(searchParams)
    if (activeStarred) params.delete("starred")
    else params.set("starred", "1")
    setSearchParams(params)
  }

  const handleCatChange = (id) => {
    const params = new URLSearchParams(searchParams)
    if (id) params.set("cat", id)
    else params.delete("cat")
    setSearchParams(params)
  }

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("cat")
    params.delete("starred")
    params.delete("tag")
    params.delete("untagged")
    setSearchParams(params)
  }

  const handleClearTag = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("tag")
    setSearchParams(params)
  }

  const handleClearHealthFilter = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("cat")
    params.delete("untagged")
    setSearchParams(params)
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds([])
    setBatchCat("")
  }

  const handleSelectAll = () => {
    const visibleIds = filtered.map((t) => t.id)
    setSelectedIds((prev) => (prev.length === visibleIds.length ? [] : visibleIds))
  }

  const handleBatchCategory = () => {
    if (!batchCat || selectedIds.length === 0) return
    const categoryId = batchCat === "__none__" ? null : batchCat
    selectedIds.forEach((id) => updateTip(id, { categoryId }))
    setNotice(`已更新 ${selectedIds.length} 条技巧的分类`)
    exitSelectMode()
  }

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => deleteTip(id))
    setNotice(`已将 ${selectedIds.length} 条技巧移入回收站`)
    setConfirmBatchDelete(false)
    exitSelectMode()
  }

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams)
    if (value === "newest") params.delete("sort")
    else params.set("sort", value)
    setSearchParams(params)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(buildBackup({ tips, categories, tags }), null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lifeskill-" + formatDate(Date.now()).replaceAll("/", "-") + ".json"
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    setNotice(`已导出 ${tips.length} 条技巧、${categories.length} 个分类、${tags.length} 个标签`)
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      setPendingSource("file")
      setPendingImport(parseBackup(await file.text()))
    } catch (err) {
      setNotice("导入失败：" + err.message)
    }
  }

  const handleSnapshotRestore = () => {
    const snapshot = readSnapshot()
    if (!snapshot) {
      setHasSnapshot(false)
      setNotice("没有可恢复的自动备份")
      return
    }
    setPendingSource("snapshot")
    setPendingImport(snapshot)
  }

  const handleConfirmImport = (mode = "overwrite") => {
    if (!pendingImport) return
    const current = { tips, categories, tags }
    const snapshotSaved = saveSnapshot(current)
    if (snapshotSaved) setHasSnapshot(true)

    const next = mode === "merge" ? mergeBackup(current, pendingImport) : pendingImport
    importData(next)

    const prefix = snapshotSaved ? "" : "自动备份失败。"
    if (mode === "merge") {
      setNotice(`${prefix}已合并导入 ${pendingImport.tips.length} 条技巧，当前共 ${next.tips.length} 条`)
    } else if (pendingSource === "snapshot") {
      setNotice(`${prefix}已恢复上次导入前的 ${next.tips.length} 条技巧`)
    } else {
      setNotice(`${prefix}已导入 ${pendingImport.tips.length} 条技巧，原有数据已被覆盖`)
    }
    setPendingImport(null)
  }

  return (
    <div>
      <h1 className={pageTitle}>
        <span className="hand-underline">生活小技巧</span>
      </h1>
      <p className={pageDesc}>
        记录那些让生活更美好的小妙招 ✨
      </p>

      <FilterBar
        activeCat={activeCat}
        onCatChange={handleCatChange}
        activeStarred={activeStarred}
        onStarredChange={handleStarredChange}
        activeTag={activeTag}
        activeExtra={activeCat === "__none__" || untaggedOnly}
        onReset={handleResetFilters}
        sort={sort}
        onSortChange={handleSortChange}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button className={`${btnOutline} ${btnSm}`} onClick={handleRandom}>
          🎲 随机一条
        </button>
        <button className={`${btnOutline} ${btnSm}`} onClick={handleExport}>
          ⬇️ 导出备份
        </button>
        <button className={`${btnOutline} ${btnSm}`} onClick={() => fileRef.current?.click()}>
          ⬆️ 导入备份
        </button>
        {hasSnapshot && (
          <button className={`${btnOutline} ${btnSm}`} onClick={handleSnapshotRestore}>
            ↩️ 恢复导入前备份
          </button>
        )}
        <button
          className={`${selectMode ? btnDanger : btnOutline} ${btnSm}`}
          onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
        >
          {selectMode ? "✕ 退出多选" : "☑️ 批量选择"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      {notice && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center gap-3 rounded-sketch border-2 border-primary bg-primary-light px-4 py-2.5 text-sm text-ink"
        >
          <span>{notice}</span>
          {undoId && (
            <button type="button" className="font-display text-primary hover:underline" onClick={handleUndoDelete}>
              撤销
            </button>
          )}
        </div>
      )}

      {search && (
        <div className="mb-4 text-sm text-ink-soft">
          搜索 &ldquo;{search}&rdquo; 共 {filtered.length} 条结果
        </div>
      )}

      {activeTag && (
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
          标签「#{tagMap.get(activeTag)?.name}」共 {filtered.length} 条
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={handleClearTag}
          >
            清除
          </button>
        </div>
      )}

      {selectMode && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-sketch border-2 border-dashed border-primary bg-card p-3">
          <span className="font-hand text-sm text-ink-soft">已选 {selectedIds.length} 条</span>
          <button type="button" className={`${btnOutline} ${btnSm}`} onClick={handleSelectAll}>
            全选 / 取消全选
          </button>
          <select
            aria-label="批量设置分类"
            className="select-arrow cursor-pointer rounded-sketch border-2 border-line bg-card py-1 pl-3 pr-9 text-[13px] text-ink-soft"
            value={batchCat}
            onChange={(e) => setBatchCat(e.target.value)}
          >
            <option value="">选择分类</option>
            <option value="__none__">未分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`${btnOutline} ${btnSm}`}
            disabled={!batchCat || selectedIds.length === 0}
            onClick={handleBatchCategory}
          >
            应用分类
          </button>
          <button
            type="button"
            className={`${btnDanger} ${btnSm}`}
            disabled={selectedIds.length === 0}
            onClick={() => setConfirmBatchDelete(true)}
          >
            批量删除
          </button>
        </div>
      )}

      {(activeCat === "__none__" || untaggedOnly) && (
        <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
          {activeCat === "__none__" ? "未分类" : "无标签"}技巧共 {filtered.length} 条
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={handleClearHealthFilter}
          >
            清除
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="mb-3 text-5xl">🔍</div>
          <h3 className="mb-2 font-display text-xl text-ink">没有找到技巧</h3>
          <p className="mb-5 text-sm text-ink-soft">
            {search
              ? "换个关键词试试，或者点击「+ 新技巧」添加"
              : "点击「+ 新技巧」开始记录你的第一个生活妙招吧"}
          </p>
        </div>
      ) : (
        <div className="tip-grid">
          {filtered.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              search={search}
              showActions={!selectMode}
              onDelete={setDeleteId}
              selectable={selectMode}
              selected={selectedIds.includes(tip.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {confirmBatchDelete && (
        <ConfirmDialog
          title="批量删除"
          message={`将把选中的 ${selectedIds.length} 条技巧移入回收站，可在回收站恢复。`}
          onConfirm={handleBatchDelete}
          onCancel={() => setConfirmBatchDelete(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="删除技巧"
          message="删除后会移入回收站，可在回收站恢复或永久删除。"
          onConfirm={() => {
            deleteTip(deleteId)
            setDeleteId(null)
            setUndoId(deleteId)
            setNotice("已移入回收站，可点击撤销")
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {pendingImport && (
        <ConfirmDialog
          title={pendingSource === "snapshot" ? "恢复自动备份" : "导入备份"}
          message={
            pendingSource === "snapshot"
              ? `将把当前数据恢复为上次导入前的 ${pendingImport.tips.length} 条技巧；当前数据会先另存为新的自动备份。`
              : `当前数据（${tips.length} 条技巧、${categories.length} 个分类、${tags.length} 个标签）会先自动备份。覆盖导入会替换全部数据；合并导入会按 id 去重并保留更新时间较新的版本。`
          }
          confirmText={pendingSource === "snapshot" ? "恢复备份" : "覆盖并导入"}
          secondaryText={pendingSource === "snapshot" ? undefined : "合并导入"}
          onSecondary={pendingSource === "snapshot" ? undefined : () => handleConfirmImport("merge")}
          onConfirm={() => handleConfirmImport("overwrite")}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </div>
  )
}
