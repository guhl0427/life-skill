import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import Icon from "../components/Icon"
import { formatDate, formatDateTime } from "../utils/format"
import { btnPrimary, btnOutline, btnDanger, btnSm } from "../components/ui"

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 继续尝试兜底方案
    }
  }
  try {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.top = "-9999px"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  } catch {
    return false
  }
}

export default function TipDetail() {
  const { id } = useParams()
  const { tips, getTip, categoryMap, tagMap, toggleStar, deleteTip, markUsed } = useApp()
  const navigate = useNavigate()
  const [showDelete, setShowDelete] = useState(false)
  const [copyState, setCopyState] = useState("idle")
  const tip = getTip(id)

  if (!tip) {
    return (
      <div className="px-5 py-16 text-center">
        <div className="mb-3 text-5xl">😅</div>
        <h3 className="mb-5 font-display text-xl text-ink">技巧不存在</h3>
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

  const handleBack = () => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate("/")
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
    const ok = await copyToClipboard(parts.join("\n"))
    setCopyState(ok ? "success" : "error")
    setTimeout(() => setCopyState("idle"), ok ? 2000 : 4000)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleBack}
        className="mb-3 inline-flex items-center gap-1.5 rounded-sketch-sm text-sm text-ink-soft transition-colors duration-200 hover:text-primary"
      >
        <Icon name="back" className="h-4 w-4" />
        返回
      </button>

      <h1 className="mb-6 font-display text-[30px] leading-tight tracking-[0.5px] text-ink max-md:text-2xl max-[480px]:text-[22px]">
        {tip.title}
      </h1>

      <div className="mx-auto max-w-[720px]">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {cat && (
            <span
              className="flex items-center gap-1 whitespace-nowrap rounded-sketch-sm border border-line-soft border-l-2 bg-paper-deep px-2.5 py-0.5 text-[13px] text-ink-soft"
              style={{ borderLeftColor: cat.color }}
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
          <span className="text-sm tabular-nums text-ink-faint">
            {formatDate(tip.createdAt)}
          </span>
        </div>

        <div className="whitespace-pre-wrap rounded-sketch-lg border-[1.5px] border-line bg-card p-6 text-base leading-loose text-ink shadow-ink max-md:p-[18px] max-[480px]:p-3.5">
          {tip.content}
        </div>

        {tip.steps?.length > 0 && (
          <ol className="mt-5 flex flex-col gap-2.5">
            {tip.steps.map((step, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-sketch border-[1.5px] border-line bg-card p-4 shadow-ink max-[480px]:p-2.5"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-on-primary">
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
          {tip.usageCount > 0 && (
            <span className="text-sm tabular-nums text-ink-soft">
              已使用 {tip.usageCount} 次
              {tip.lastUsedAt ? " · 最近 " + formatDate(tip.lastUsedAt) : ""}
            </span>
          )}
        </div>

        {tipTags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
            {tipTags.map((t) => (
              <Link
                key={t.id}
                to={"/?tag=" + encodeURIComponent(t.id)}
                className="text-[13px] text-ink-faint transition-colors duration-200 hover:text-primary"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3 border-t-2 border-line-soft pt-5 max-md:flex-col">
          <Link to={"/tips/" + id + "/edit"} className={`${btnPrimary} max-md:w-full`}>
            编辑
          </Link>
          <div className="flex gap-3 max-md:w-full">
            <button className={`${btnOutline} max-md:flex-1`} onClick={handleCopy}>
              {copyState === "success" ? "✅ 已复制" : copyState === "error" ? "复制失败" : "📋 复制"}
            </button>
            <button className={`${btnDanger} max-md:flex-1`} onClick={() => setShowDelete(true)}>
              删除
            </button>
          </div>
        </div>

        {copyState === "error" && (
          <p role="alert" className="mt-2 text-sm text-danger">
            复制失败，请长按或选中上方内容手动复制。
          </p>
        )}

        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg text-ink">相关技巧</h2>
            <div className="flex flex-col gap-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={"/tips/" + item.id}
                  className="rounded-sketch border-[1.5px] border-line bg-card px-4 py-3 text-sm text-ink-soft shadow-ink transition-colors duration-200 hover:border-primary hover:text-primary"
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
    </div>
  )
}
