import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import { pageTitle, btnPrimary } from "../components/ui"
import { formatDate } from "../utils/format"

export default function Stats() {
  const { tips, categories, tags } = useApp()

  const stats = useMemo(() => {
    const active = tips.filter((t) => !t.deletedAt)
    const total = active.length
    const starred = active.filter((t) => t.starred).length

    const catCount = new Map()
    const tagCount = new Map()
    const categoryIds = new Set(categories.map((cat) => cat.id))
    let uncategorized = 0
    let totalUsage = 0
    let usedTips = 0

    for (const tip of active) {
      const usageCount = tip.usageCount || 0
      totalUsage += usageCount
      if (usageCount > 0) usedTips++
      if (tip.categoryId && categoryIds.has(tip.categoryId)) {
        catCount.set(tip.categoryId, (catCount.get(tip.categoryId) || 0) + 1)
      } else {
        uncategorized++
      }
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

    const usedCats = catCounts.filter((cat) => cat.count > 0)
    const unusedCats = catCounts.filter((cat) => cat.count === 0)
    const uncategorizedStat = {
      count: uncategorized,
      percentage: total > 0 ? Math.round((uncategorized / total) * 100) : 0,
    }

    const tagCounts = tags
      .map((tag) => ({ ...tag, count: tagCount.get(tag.id) || 0 }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const untagged = active.filter((t) => !(t.tagIds || []).length).length
    const trashedCount = tips.filter((t) => t.deletedAt).length
    const neverUsed = total - usedTips
    const topUsed = active
      .filter((tip) => (tip.usageCount || 0) > 0)
      .sort(
        (a, b) =>
          (b.usageCount || 0) - (a.usageCount || 0) ||
          (b.lastUsedAt || 0) - (a.lastUsedAt || 0)
      )
      .slice(0, 5)
    const staleTips = [...active]
      .sort(
        (a, b) =>
          (a.lastUsedAt || 0) - (b.lastUsedAt || 0) ||
          a.createdAt - b.createdAt
      )
      .slice(0, 5)

    return {
      total, starred, usedCats, unusedCats, uncategorizedStat,
      tagCounts, untagged, trashedCount,
      totalUsage, usedTips, neverUsed, topUsed, staleTips,
    }
  }, [tips, categories, tags])

  if (stats.total === 0) {
    return (
      <div>
        <h1 className={`${pageTitle} mb-6`}><span className="hand-underline">统计看板</span></h1>
        <div className="px-5 py-16 text-center">
          <div className="mb-3 text-3xl">📊</div>
          <h3 className="mb-4 font-display text-xl text-ink">还没有技巧</h3>
          <Link to="/tips/new" className={btnPrimary}>新建技巧</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={`${pageTitle} mb-6`}><span className="hand-underline">统计看板</span></h1>

      <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-sketch-lg border-2 border-line bg-line-soft shadow-ink md:grid-cols-4">
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[26px] leading-tight tabular-nums text-primary max-[480px]:text-[22px]">{stats.total}</div>
          <div className="mt-1 text-xs text-ink-soft">总技巧数</div>
        </div>
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[26px] leading-tight tabular-nums text-primary max-[480px]:text-[22px]">{categories.length}</div>
          <div className="mt-1 text-xs text-ink-soft">分类数</div>
        </div>
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[26px] leading-tight tabular-nums text-primary max-[480px]:text-[22px]">{tags.length}</div>
          <div className="mt-1 text-xs text-ink-soft">标签数</div>
        </div>
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[26px] leading-tight tabular-nums text-primary max-[480px]:text-[22px]">{stats.starred}</div>
          <div className="mt-1 text-xs text-ink-soft">已收藏</div>
        </div>
      </div>

      <h2 className="mb-4 font-display text-lg text-ink">使用情况</h2>
      <div className="mb-4 grid grid-cols-3 gap-px overflow-hidden rounded-sketch-lg border-2 border-line bg-line-soft shadow-ink max-[480px]:grid-cols-1">
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[22px] leading-tight tabular-nums text-primary">{stats.totalUsage}</div>
          <div className="mt-1 text-xs text-ink-soft">累计使用次数</div>
        </div>
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[22px] leading-tight tabular-nums text-primary">{stats.usedTips}</div>
          <div className="mt-1 text-xs text-ink-soft">用过的技巧</div>
        </div>
        <div className="bg-card px-4 py-4 text-center">
          <div className="font-display text-[22px] leading-tight tabular-nums text-primary">{stats.neverUsed}</div>
          <div className="mt-1 text-xs text-ink-soft">从未使用</div>
        </div>
      </div>

      {stats.topUsed.length > 0 ? (
        <>
          <h3 className="mb-2 text-sm text-ink-soft">最常使用</h3>
          <div className="mb-8 flex flex-col gap-2">
            {stats.topUsed.map((tip, index) => (
              <Link
                key={tip.id}
                to={"/tips/" + tip.id}
                className="flex items-center justify-between gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-2.5 text-sm shadow-ink transition-colors duration-200 hover:border-primary"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-4 shrink-0 text-center font-hand text-ink-faint">{index + 1}</span>
                  <span className="truncate text-ink">{tip.title}</span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-ink-faint">
                  用过 {tip.usageCount} 次
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <p className="mb-8 text-sm text-ink-faint">
          还没有使用记录，在技巧详情页点“今天用到了”即可累计。
        </p>
      )}

      <h3 className="mb-2 text-sm text-ink-soft">最久没用</h3>
      <div className="mb-3 flex flex-col gap-2">
        {stats.staleTips.map((tip) => (
          <Link
            key={tip.id}
            to={"/tips/" + tip.id}
            className="flex items-center justify-between gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-2.5 text-sm shadow-ink transition-colors duration-200 hover:border-primary"
          >
            <span className="truncate text-ink">{tip.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-ink-faint">
              {tip.lastUsedAt ? "上次 " + formatDate(tip.lastUsedAt) : "从未用过"}
            </span>
          </Link>
        ))}
      </div>
      <div className="mb-8">
        <Link to="/?sort=least" className="text-sm text-primary hover:underline">
          按最少使用查看全部 →
        </Link>
      </div>

      <h2 className="mb-4 font-display text-lg text-ink">分类分布</h2>
      <div className="mb-8 flex flex-col gap-3">
        {stats.usedCats.map((cat) => (
          <div key={cat.id} className="py-1">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-display">{cat.emoji} {cat.name}</span>
              <span className="text-[13px] tabular-nums text-ink-soft">{cat.count} / {stats.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded border border-line-soft bg-paper-deep">
              <div
                className="h-full min-w-1 rounded transition-[width] duration-[600ms] ease-spring"
                style={{ width: cat.percentage + "%", background: cat.color }}
              />
            </div>
          </div>
        ))}
        {stats.uncategorizedStat.count > 0 && (
          <div className="py-1">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-display">📥 未分类</span>
              <span className="text-[13px] tabular-nums text-ink-soft">{stats.uncategorizedStat.count} / {stats.total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded border border-line-soft bg-paper-deep">
              <div
                className="h-full min-w-1 rounded bg-ink-faint transition-[width] duration-[600ms] ease-spring"
                style={{ width: stats.uncategorizedStat.percentage + "%" }}
              />
            </div>
          </div>
        )}
      </div>

      {stats.tagCounts.length > 0 && (
        <>
          <h2 className="mb-4 font-display text-lg text-ink">常用标签</h2>
          <div className="mb-8 flex flex-wrap gap-2.5">
            {stats.tagCounts.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-2 rounded-sketch border border-line-soft bg-paper-deep px-3.5 py-1.5 text-[15px]"
              >
                {tag.name}
                <span className="rounded-sketch-sm bg-card px-2 text-xs tabular-nums text-ink-faint">{tag.count}</span>
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Link
          to="/?cat=__none__"
          className="flex items-center justify-between gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-3 shadow-ink transition-colors duration-200 hover:border-primary"
        >
          <span className="text-[13px] text-ink-soft">📥 未分类技巧</span>
          <span className="font-display text-lg tabular-nums text-primary">{stats.uncategorizedStat.count}</span>
        </Link>
        <Link
          to="/?untagged=1"
          className="flex items-center justify-between gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-3 shadow-ink transition-colors duration-200 hover:border-primary"
        >
          <span className="text-[13px] text-ink-soft">🏷️ 无标签技巧</span>
          <span className="font-display text-lg tabular-nums text-primary">{stats.untagged}</span>
        </Link>
        <Link
          to="/categories"
          className="flex items-center justify-between gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-3 shadow-ink transition-colors duration-200 hover:border-primary"
        >
          <span className="text-[13px] text-ink-soft">📋 空分类</span>
          <span className="font-display text-lg tabular-nums text-primary">{stats.unusedCats.length}</span>
        </Link>
        <Link
          to="/trash"
          className="flex items-center justify-between gap-3 rounded-sketch border-[1.5px] border-line bg-card px-4 py-3 shadow-ink transition-colors duration-200 hover:border-primary"
        >
          <span className="text-[13px] text-ink-soft">🗑️ 回收站</span>
          <span className="font-display text-lg tabular-nums text-primary">{stats.trashedCount}</span>
        </Link>
      </div>
    </div>
  )
}
