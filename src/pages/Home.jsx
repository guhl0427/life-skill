import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { useApp } from "../context/AppContext"
import TipCard from "../components/TipCard"
import FilterBar from "../components/FilterBar"
import ConfirmDialog from "../components/ConfirmDialog"

export default function Home() {
  const { tips, deleteTip } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCat = searchParams.get("cat") || ""
  const search = searchParams.get("q") || ""
  const [sort, setSort] = useState("newest")
  const [deleteId, setDeleteId] = useState(null)

  const filtered = useMemo(() => {
    let result = [...tips]
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
  }, [tips, activeCat, search, sort])

  const handleCatChange = (id) => {
    const params = new URLSearchParams(searchParams)
    if (id) params.set("cat", id)
    else params.delete("cat")
    setSearchParams(params)
  }

  return (
    <div>
      <h1 className="page-title">
        <span className="hand-underline">生活小技巧</span>
      </h1>
      <p className="page-desc">
        记录那些让生活更美好的小妙招 ✨
      </p>

      <FilterBar
        activeCat={activeCat}
        onCatChange={handleCatChange}
        sort={sort}
        onSortChange={setSort}
      />

      {search && (
        <div style={{ marginBottom: 16, fontSize: 14, color: "var(--text-secondary)" }}>
          搜索 &ldquo;{search}&rdquo; 共 {filtered.length} 条结果
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>没有找到技巧</h3>
          <p>
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
