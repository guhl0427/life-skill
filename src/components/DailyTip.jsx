import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import { btnOutline, btnSm } from "./ui"

export default function DailyTip() {
  const { tips, categoryMap } = useApp()
  const active = useMemo(() => tips.filter((tip) => !tip.deletedAt), [tips])
  const [pickId, setPickId] = useState(() => active[0]?.id || null)
  const tip = active.find((item) => item.id === pickId) || active[0]

  if (!tip) return null
  const category = categoryMap.get(tip.categoryId)

  const shuffle = () => {
    if (active.length < 2) return
    let next = tip
    while (next.id === tip.id) {
      next = active[Math.floor(Math.random() * active.length)]
    }
    setPickId(next.id)
  }

  return (
    <section className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-sketch-lg border-2 border-primary/40 bg-primary-light px-5 py-4 shadow-ink max-[480px]:px-3.5 max-[480px]:py-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs text-ink-faint">
          <span className="font-display text-primary">今天试试这个</span>
          {category && (
            <span>
              · {category.emoji} {category.name}
            </span>
          )}
        </div>
        <Link
          to={"/tips/" + tip.id}
          className="line-clamp-1 font-display text-lg text-ink transition-colors duration-200 hover:text-primary"
        >
          {tip.title}
        </Link>
        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">{tip.content}</p>
      </div>
      <button type="button" className={`${btnOutline} ${btnSm} shrink-0`} onClick={shuffle}>
        换一条
      </button>
    </section>
  )
}
