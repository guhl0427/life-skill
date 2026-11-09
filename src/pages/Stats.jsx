import { useMemo } from "react"
import { useApp } from "../context/useApp"
import { formatDate } from "../utils/format"
import { pageTitle, pageDesc } from "../components/ui"

export default function Stats() {
  const { tips, categories, tags } = useApp()

  const stats = useMemo(() => {
    const total = tips.length
    const starred = tips.filter((t) => t.starred).length

    const catCount = new Map()
    const tagCount = new Map()
    for (const tip of tips) {
      if (tip.categoryId) catCount.set(tip.categoryId, (catCount.get(tip.categoryId) || 0) + 1)
      for (const id of tip.tagIds || []) tagCount.set(id, (tagCount.get(id) || 0) + 1)
    }

    const catCounts = categories
      .map((cat) => {
        const count = catCount.get(cat.id) || 0
        return {
          ...cat,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }
      })
      .sort((a, b) => b.count - a.count)

    const tagCounts = tags
      .map((tag) => ({ ...tag, count: tagCount.get(tag.id) || 0 }))
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
        <h1 className={pageTitle}><span className="hand-underline">统计看板</span></h1>
        <p className={pageDesc}>你的生活技巧库数据概览</p>
        <div className="px-5 py-16 text-center">
          <div className="mb-3 text-5xl">📊</div>
          <h3 className="mb-2 font-display text-xl text-ink">还没有技巧</h3>
          <p className="text-sm text-ink-soft">添加一些技巧后再来看看统计数据吧</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={pageTitle}><span className="hand-underline">统计看板</span></h1>
      <p className={pageDesc}>你的生活技巧库数据概览</p>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 max-[480px]:grid-cols-2">
        <div className="rounded-sketch-lg border-2 border-line bg-card p-5 text-center shadow-ink">
          <div className="font-display text-4xl leading-tight text-primary max-[480px]:text-[28px]">{stats.total}</div>
          <div className="mt-1 font-hand text-[13px] text-ink-soft">总技巧数</div>
        </div>
        <div className="rounded-sketch-lg border-2 border-line bg-card p-5 text-center shadow-ink">
          <div className="font-display text-4xl leading-tight text-primary max-[480px]:text-[28px]">{categories.length}</div>
          <div className="mt-1 font-hand text-[13px] text-ink-soft">分类数</div>
        </div>
        <div className="rounded-sketch-lg border-2 border-line bg-card p-5 text-center shadow-ink">
          <div className="font-display text-4xl leading-tight text-primary max-[480px]:text-[28px]">{tags.length}</div>
          <div className="mt-1 font-hand text-[13px] text-ink-soft">标签数</div>
        </div>
        <div className="rounded-sketch-lg border-2 border-line bg-card p-5 text-center shadow-ink">
          <div className="font-display text-4xl leading-tight text-primary max-[480px]:text-[28px]">{stats.starred}</div>
          <div className="mt-1 font-hand text-[13px] text-ink-soft">已收藏</div>
        </div>
      </div>

      <h2 className="mb-4 font-display text-lg text-ink">分类分布</h2>
      <div className="mb-8 flex flex-col gap-3">
        {stats.catCounts.map((cat) => (
          <div key={cat.id} className="py-1">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-display">{cat.emoji} {cat.name}</span>
              <span className="text-[13px] text-ink-soft">{cat.count} / {stats.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded border border-line-soft bg-paper-deep">
              <div
                className="h-full min-w-1 rounded transition-[width] duration-[600ms] ease-spring"
                style={{ width: cat.percentage + "%", background: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {stats.tagCounts.length > 0 && (
        <>
          <h2 className="mb-4 font-display text-lg text-ink">最常用标签 Top 5</h2>
          <div className="mb-8 flex flex-wrap gap-2.5">
            {stats.tagCounts.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-2 rounded-sketch border border-line-soft bg-paper-deep px-3.5 py-1.5 font-hand text-[15px]"
              >
                {tag.name}
                <span className="rounded-md bg-card px-2 text-xs text-ink-faint">{tag.count}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {stats.newest && (
        <div className="rounded-sketch border border-dashed border-line-soft bg-paper-deep p-4 text-center font-hand text-[13px] text-ink-soft">
          最新技巧：「{stats.newest.title}」— {formatDate(stats.newest.createdAt)}
        </div>
      )}
    </div>
  )
}
