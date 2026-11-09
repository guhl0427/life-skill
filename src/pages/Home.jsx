import { useState, useMemo, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useApp } from "../context/useApp"
import TipCard from "../components/TipCard"
import FilterBar from "../components/FilterBar"
import ConfirmDialog from "../components/ConfirmDialog"
import { btnOutline, btnSm, pageTitle, pageDesc } from "../components/ui"

export default function Home() {
  const { tips, deleteTip } = useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCat = searchParams.get("cat") || ""
  const search = searchParams.get("q") || ""
  const activeStarred = searchParams.get("starred") === "1"
  const sortParam = searchParams.get("sort")
  const sort = ["newest", "oldest", "title"].includes(sortParam) ? sortParam : "newest"
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    let result = [...tips]
    if (activeStarred) result = result.filter((t) => t.starred)
    if (activeCat) result = result.filter((t) => t.categoryId === activeCat)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
      )
    }
    if (sort === "newest") result.sort((a, b) => b.createdAt - a.createdAt)
    else if (sort === "oldest") result.sort((a, b) => a.createdAt - b.createdAt)
    else if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title, "zh"))
    return result
  }, [tips, activeCat, search, sort, activeStarred])

  const handleRandom = useCallback(() => {
    if (tips.length === 0) return
    const i = Math.floor(Math.random() * tips.length)
    navigate("/tips/" + tips[i].id)
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

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams)
    if (value === "newest") params.delete("sort")
    else params.set("sort", value)
    setSearchParams(params)
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
        sort={sort}
        onSortChange={handleSortChange}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`${btnOutline} ${btnSm}`} onClick={handleRandom}>
          🎲 随机一条
        </button>
      </div>

      {search && (
        <div className="mb-4 text-sm text-ink-soft">
          搜索 &ldquo;{search}&rdquo; 共 {filtered.length} 条结果
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
              showActions
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="删除技巧"
          message="确定要删除这个技巧吗？删除后无法恢复。"
          onConfirm={() => { deleteTip(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
