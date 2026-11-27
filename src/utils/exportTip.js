import { formatDate } from "./format"

function safeFileName(text) {
  return (
    String(text || "tip")
      .replace(/[\\/:*?"<>|\s]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tip"
  )
}

// 单条技巧正文（不含标题与页脚），供单条与批量导出复用
function buildTipBodyLines(tip, category, tags = []) {
  const lines = []
  const meta = []
  if (category) meta.push(`分类：${category.emoji} ${category.name}`)
  if (tip.duration) meta.push(`耗时：${tip.duration}`)
  if (tip.difficulty) meta.push(`难度：${tip.difficulty}`)
  if (meta.length > 0) {
    lines.push(`> ${meta.join(" · ")}`, "")
  }
  if (tip.scenario) {
    lines.push(`**适用场景**：${tip.scenario}`, "")
  }
  if (tip.content) {
    lines.push("## 内容", "", tip.content, "")
  }
  if (tip.materials?.length > 0) {
    lines.push("## 材料", "", ...tip.materials.map((item) => `- ${item}`), "")
  }
  if (tip.steps?.length > 0) {
    lines.push("## 步骤", "", ...tip.steps.map((step, index) => `${index + 1}. ${step}`), "")
  }
  if (tip.notes) {
    lines.push("## 注意事项", "", tip.notes, "")
  }
  if (tags.length > 0) {
    lines.push("## 标签", "", tags.map((tag) => `#${tag.name}`).join(" "), "")
  }
  return lines
}

export function buildTipMarkdown(tip, category, tags = []) {
  return [
    `# ${tip.title}`,
    "",
    ...buildTipBodyLines(tip, category, tags),
    "---",
    "",
    `来自 LifeSkill · ${formatDate(Date.now())}`,
  ].join("\n")
}

// 将当前筛选结果导出为一份 Markdown 合集，按顺序编号，去掉单条页脚
export function buildTipsMarkdown(tips = [], categoryMap, tagMap) {
  if (!tips.length) return ""
  const header = [
    "# LifeSkill 技巧集",
    "",
    `> 共 ${tips.length} 条技巧 · 导出于 ${formatDate(Date.now())}`,
  ].join("\n")
  const sections = tips.map((tip, index) => {
    const tags = (tip.tagIds || []).map((id) => tagMap?.get(id)).filter(Boolean)
    return [
      `## ${index + 1}. ${tip.title}`,
      "",
      ...buildTipBodyLines(tip, categoryMap?.get(tip.categoryId), tags),
    ].join("\n")
  })
  return [header, ...sections].join("\n\n---\n\n")
}

function triggerDownload(content, fileName) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadTipMarkdown(tip, category, tags = []) {
  triggerDownload(
    buildTipMarkdown(tip, category, tags),
    "lifeskill-" + safeFileName(tip.title) + ".md"
  )
}

export function downloadTipsMarkdown(tips = [], categoryMap, tagMap) {
  if (!tips.length) return
  triggerDownload(
    buildTipsMarkdown(tips, categoryMap, tagMap),
    "lifeskill-技巧集-" + formatDate(Date.now()).replaceAll("/", "-") + ".md"
  )
}
