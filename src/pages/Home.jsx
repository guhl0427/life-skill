import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useLocation, Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import TipCard from "../components/TipCard"
import FilterBar from "../components/FilterBar"
import ConfirmDialog from "../components/ConfirmDialog"
import Select from "../components/Select"
import { matchesTip } from "../utils/search"
import Icon from "../components/Icon"
import { btnOutline, btnDanger, btnSm, btnPrimary, pageTitle } from "../components/ui"

export default function Home() {
  const { tips, categories, categoryMap, tagMap, deleteTip, updateTip, restoreTip } = useApp()
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
  const [notice, setNotice] = useState(() =>
    location.state?.deletedId ? "已移入回收站，可点击撤销" : ""
  )
  const [undoId, setUndoId] = useState(location.state?.deletedId || null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [batchCat, setBatchCat] = useState("")
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false)

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

  const handleClearQuery = (...keys) => {
    const params = new URLSearchParams(searchParams)
    keys.forEach((key) => params.delete(key))
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

  return (
    <div>
      <h1 className={`${pageTitle} mb-6`}>
        <span className="hand-underline">生活小技巧</span>
      </h1>

      <FilterBar
        activeCat={activeCat}
        onCatChange={handleCatChange}
        activeStarred={activeStarred}
        onStarredChange={handleStarredChange}
        activeTag={activeTag}
        activeTagName={tagMap.get(activeTag)?.name || ""}
        untagged={untaggedOnly}
        uncategorized={activeCat === "__none__"}
        onClearTag={() => handleClearQuery("tag")}
        onClearExtra={() => handleClearQuery("cat", "untagged")}
        onReset={handleResetFilters}
        sort={sort}
        onSortChange={handleSortChange}
      />

      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <button
          className={`${selectMode ? btnDanger : btnOutline} ${btnSm}`}
          onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
        >
          {selectMode ? "退出多选" : (
            <>
              <Icon name="checkbox" className="h-4 w-4" />
              批量选择
            </>
          )}
        </button>
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

      {selectMode && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-sketch border-2 border-primary bg-card p-3">
          <span className="text-sm text-ink-soft">已选 {selectedIds.length} 条</span>
          <button type="button" className={`${btnOutline} ${btnSm}`} onClick={handleSelectAll}>
            全选 / 取消全选
          </button>
          <Select
            ariaLabel="批量设置分类"
            triggerClassName="cursor-pointer rounded-sketch border-2 border-line bg-card py-1 pl-3 pr-3 text-[13px] text-ink-soft transition-colors duration-200 hover:border-primary hover:text-ink"
            value={batchCat}
            onChange={setBatchCat}
            options={[
              { value: "", label: "选择分类" },
              { value: "__none__", label: "未分类" },
              ...categories.map((cat) => ({ value: cat.id, label: `${cat.emoji} ${cat.name}` })),
            ]}
          />
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

      {filtered.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="mb-3 text-3xl">🔍</div>
          <h3 className="mb-4 font-display text-xl text-ink">
            {search || activeCat || activeStarred || activeTag || untaggedOnly
              ? "没有匹配的技巧"
              : "还没有技巧"}
          </h3>
          <Link to="/tips/new" className={btnPrimary}>
            新建技巧
          </Link>
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
    </div>
  )
}
