import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import { formatDate, formatDateTime } from "../utils/format"
import { btnPrimary, btnOutline, btnDanger, btnSm, backLink } from "../components/ui"

export default function TipDetail() {
  const { id } = useParams()
  const { tips, getTip, categoryMap, tagMap, toggleStar, deleteTip, markUsed } = useApp()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  const [copied, setCopied] = useState(false)
  const tip = getTip(id)

  if (!tip) {
    return (
      <div className="px-5 py-16 text-center">
        <div className="mb-3 text-5xl">😅</div>
        <h3 className="mb-2 font-display text-xl text-ink">技巧不存在</h3>
        <p className="mb-5 text-sm text-ink-soft">这个技巧可能已被删除</p>
        <Link to="/" className={`${btnPrimary} mt-4`}>
          返回首页
        </Link>
      </div>
    )
  }

  const cat = categoryMap.get(tip.categoryId)
  const tipTags = (tip.tagIds || []).map((tid) => tagMap.get(tid)).filter(Boolean)

  const activeTips = tips.filter((t) => !t.deletedAt)
  const tipTagIds = new Set(tip.tagIds || [])
  const related = activeTips
    .filter((other) => {
      if (other.id === tip.id) return false
      if (tip.categoryId && other.categoryId === tip.categoryId) return true
      return (other.tagIds || []).some((tagId) => tipTagIds.has(tagId))
    })
    .slice(0, 3)

  const handleDelete = () => {
    deleteTip(id)
    navigate("/", { state: { deletedId: id } })
  }

  const handleCopy = async () => {
    const parts = []
    if (cat) parts.push("[" + cat.emoji + " " + cat.name + "]")
    parts.push(tip.title)
    parts.push("")
    parts.push(tip.content)
    if (tip.steps?.length > 0) {
      parts.push("")
      parts.push("步骤：")
      tip.steps.forEach((step, index) => parts.push(`${index + 1}. ${step}`))
    }
    if (tipTags.length > 0) {
      parts.push("")
      parts.push("标签: " + tipTags.map((t) => "#" + t.name).join(" "))
    }
    parts.push("")
    parts.push("来源: LifeSkill (" + formatDateTime(tip.createdAt) + ")")
    try {
      await navigator.clipboard.writeText(parts.join("\n"))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent fail */ }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <Link to="/" className={backLink}>← 返回首页</Link>

      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {cat && (
            <span
              className="whitespace-nowrap rounded-sketch-sm px-2.5 py-0.5 text-[13px]"
              style={{ background: cat.color + "18", color: cat.color }}
            >
              {cat.emoji} {cat.name}
            </span>
          )}
          <button
            className="text-xl leading-none transition-transform duration-200 hover:scale-125"
            onClick={() => toggleStar(id)}
            aria-label={tip.starred ? "取消收藏" : "收藏"}
            aria-pressed={!!tip.starred}
          >
            {tip.starred ? "⭐" : "☆"}
          </button>
          <span className="font-hand text-sm text-ink-faint">
            {formatDate(tip.createdAt)}
            {tip.updatedAt > tip.createdAt && (
              <span className="ml-1.5">· 编辑于 {formatDateTime(tip.updatedAt)}</span>
            )}
          </span>
        </div>
        <h1 className="mb-2 font-display text-[32px] leading-tight tracking-[2px] text-ink max-md:text-2xl max-[480px]:text-[22px]">
          {tip.title}
        </h1>
      </div>

      <div className="whitespace-pre-wrap rounded-sketch-lg border-2 border-line bg-card p-6 text-base leading-loose text-ink shadow-ink max-md:p-[18px] max-[480px]:p-3.5">
        {tip.content}
      </div>

      {tip.steps?.length > 0 && (
        <ol className="mt-5 flex flex-col gap-2.5">
          {tip.steps.map((step, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-sketch border-2 border-line bg-card p-4 shadow-ink max-[480px]:p-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                {index + 1}
              </span>
              <span className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{step}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className={`${btnOutline} ${btnSm}`} onClick={() => markUsed(id)}>
          ✅ 今天用到了
        </button>
        <span className="font-hand text-sm text-ink-soft">
          {tip.usageCount
            ? `已使用 ${tip.usageCount} 次${tip.lastUsedAt ? " · 最近 " + formatDate(tip.lastUsedAt) : ""}`
            : "还没有使用记录"}
        </span>
      </div>

      {tipTags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tipTags.map((t) => (
            <Link
              key={t.id}
              to={"/?tag=" + encodeURIComponent(t.id)}
              className="rounded-sketch-sm border border-line-soft bg-paper-deep px-3.5 py-1 font-hand text-[13px] text-ink-soft transition-colors duration-200 hover:border-primary hover:text-primary"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-3 border-t-2 border-dashed border-line-soft pt-5 max-md:flex-col-reverse">
        <Link to={"/tips/" + id + "/edit"} className={btnPrimary}>
          编辑
        </Link>
        <button className={btnOutline} onClick={handleCopy}>
          {copied ? "✅ 已复制" : "📋 复制"}
        </button>
        <button className={btnDanger} onClick={() => setShowDelete(true)}>
          删除
        </button>
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-lg text-ink">相关技巧</h2>
          <div className="flex flex-col gap-2">
            {related.map((item) => (
              <Link
                key={item.id}
                to={"/tips/" + item.id}
                className="rounded-sketch border-2 border-line bg-card px-4 py-3 text-sm text-ink-soft shadow-ink transition-colors duration-200 hover:border-primary hover:text-primary"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {showDelete && (
        <ConfirmDialog
          title="删除技巧"
          message="删除后会移入回收站，可在回收站恢复或永久删除。"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}
