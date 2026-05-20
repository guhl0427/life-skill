import { useMemo } from "react"
import { useApp } from "../context/AppContext"

function formatDate(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return y + "/" + m + "/" + day
}

export default function Stats() {
  const { tips, categories, tags } = useApp()

  const stats = useMemo(() => {
    const total = tips.length
    const starred = tips.filter((t) => t.starred).length

    const catCounts = categories
      .map((cat) => {
        const count = tips.filter((t) => t.categoryId === cat.id).length
        return {
          ...cat,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }
      })
      .sort((a, b) => b.count - a.count)

    const tagCounts = tags
      .map((tag) => ({
        ...tag,
        count: tips.filter((t) => t.tagIds?.includes(tag.id)).length,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const newest = tips.length > 0
      ? tips.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
      : null

    return { total, starred, catCounts, tagCounts, newest }
  }, [tips, categories, tags])

  if (stats.total === 0) {
    return (
      <div>
        <h1 className="page-title"><span className="hand-underline">统计看板</span></h1>
        <p className="page-desc">你的生活技巧库数据概览</p>
        <div className="empty-state">
          <div className="icon">📊</div>
          <h3>还没有技巧</h3>
          <p>添加一些技巧后再来看看统计数据吧</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title"><span className="hand-underline">统计看板</span></h1>
      <p className="page-desc">你的生活技巧库数据概览</p>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-num">{stats.total}</div>
          <div className="stats-label">总技巧数</div>
        </div>
        <div className="stats-card">
          <div className="stats-num">{categories.length}</div>
          <div className="stats-label">分类数</div>
        </div>
        <div className="stats-card">
          <div className="stats-num">{tags.length}</div>
          <div className="stats-label">标签数</div>
        </div>
        <div className="stats-card">
          <div className="stats-num">{stats.starred}</div>
          <div className="stats-label">已收藏</div>
        </div>
      </div>

      <h2 className="stats-section-title">分类分布</h2>
      <div className="stats-bar-list">
        {stats.catCounts.map((cat) => (
          <div key={cat.id} className="stats-bar-item">
            <div className="stats-bar-head">
              <span className="stats-bar-label">{cat.emoji} {cat.name}</span>
              <span className="stats-bar-num">{cat.count} / {stats.total}</span>
            </div>
            <div className="stats-bar-track">
              <div
                className="stats-bar-fill"
                style={{ width: cat.percentage + "%", background: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {stats.tagCounts.length > 0 && (
        <>
          <h2 className="stats-section-title">最常用标签 Top 5</h2>
          <div className="stats-tags">
            {stats.tagCounts.map((tag) => (
              <span key={tag.id} className="stats-tag">
                {tag.name}
                <span className="stats-tag-count">{tag.count}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {stats.newest && (
        <div className="stats-footer">
          最新技巧：「{stats.newest.title}」— {formatDate(stats.newest.createdAt)}
        </div>
      )}
    </div>
  )
}
